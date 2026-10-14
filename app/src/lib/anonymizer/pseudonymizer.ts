import { LANGUAGE, analyzeTexts, type RecognizerResult } from './presidioClient'

/**
 * Reversible pseudonymization of case texts before they are sent to the LLM.
 *
 * Presidio only detects; the replacement happens here so that the same value gets
 * the same placeholder across every text ("[PERSONA_1]" is always the same nephew)
 * and the generated report can be re-identified with the returned mapping.
 * The mapping holds personal data: keep it in memory, never persist or log it.
 */

/**
 * Entities replaced by default. LOCATION and ORGANIZATION are left out on purpose:
 * the agent needs the municipality and the institutions to look up regulations and
 * resources. Street addresses are covered by ES_ADDRESS.
 */
export const DEFAULT_ENTITIES = [
  'PERSON',
  'PHONE_NUMBER',
  'EMAIL_ADDRESS',
  'ES_NIF',
  'ES_NIE',
  'ES_NSS',
  'ES_HEALTH_CARD',
  'ES_ADDRESS',
  'IBAN_CODE',
  'CREDIT_CARD',
]

const PLACEHOLDER_LABELS: Record<string, string> = {
  PERSON: 'PERSONA',
  LOCATION: 'LUGAR',
  ORGANIZATION: 'ORGANIZACION',
  PHONE_NUMBER: 'TELEFONO',
  EMAIL_ADDRESS: 'EMAIL',
  ES_NIF: 'DNI',
  ES_NIE: 'NIE',
  ES_NSS: 'NSS',
  ES_HEALTH_CARD: 'TARJETA_SANITARIA',
  ES_ADDRESS: 'DIRECCION',
  IBAN_CODE: 'IBAN',
  CREDIT_CARD: 'TARJETA',
}

const LABEL_PATTERN = /^[A-Z][A-Z0-9_]{0,39}$/

/** A value known in advance (e.g. the client name) that is always replaced by `[label]`. */
export interface KnownEntity {
  text: string
  label: string
}

export interface EntityMapping {
  placeholder: string
  original: string
  entityType: string
}

export interface PseudonymizedTexts<K extends string> {
  texts: Record<K, string>
  entities: EntityMapping[]
}

/** Keeps the highest-scoring span when several results overlap; on a tie, the longest one. */
export function resolveOverlaps(results: RecognizerResult[]): RecognizerResult[] {
  const ranked = [...results].sort((a, b) => b.score - a.score || b.end - b.start - (a.end - a.start))
  const accepted: RecognizerResult[] = []
  for (const result of ranked) {
    if (accepted.every((other) => result.end <= other.start || result.start >= other.end)) {
      accepted.push(result)
    }
  }
  return accepted.sort((a, b) => a.start - b.start)
}

const words = (value: string) => value.toLocaleLowerCase('es').split(/\s+/).filter(Boolean)

/** Label of the known entity a detected person name belongs to ("Carmen" → "Carmen Ruiz Delgado"). */
function matchKnownPerson(value: string, known: KnownEntity[]): string | undefined {
  const valueWords = words(value)
  return known.find((entity) => {
    const knownWords = new Set(words(entity.text))
    return valueWords.length > 0 && valueWords.every((word) => knownWords.has(word))
  })?.label
}

function createPlaceholderTable(known: KnownEntity[]) {
  const canonical = new Map<string, string>()
  for (const entity of known) {
    if (!canonical.has(entity.label)) canonical.set(entity.label, entity.text)
  }
  const byKey = new Map<string, EntityMapping>()
  const counters = new Map<string, number>()

  const placeholderFor = (value: string, detectedType: string): string => {
    const entityType = detectedType === 'PERSON' ? (matchKnownPerson(value, known) ?? detectedType) : detectedType
    const knownOriginal = canonical.get(entityType)
    // Every variant of a known entity maps to one unnumbered tag, restored as the first given text.
    const key = knownOriginal !== undefined ? `known:${entityType}` : `${entityType}:${value.trim()}`
    let mapping = byKey.get(key)
    if (!mapping) {
      let placeholder = `[${entityType}]`
      if (knownOriginal === undefined) {
        const label = PLACEHOLDER_LABELS[entityType] ?? entityType
        const next = (counters.get(label) ?? 0) + 1
        counters.set(label, next)
        placeholder = `[${label}_${next}]`
      }
      mapping = { placeholder, original: knownOriginal ?? value.trim(), entityType }
      byKey.set(key, mapping)
    }
    return mapping.placeholder
  }

  return { placeholderFor, entities: () => [...byKey.values()] }
}

/** Replaces the detected spans of `text` with placeholders, from the end so offsets stay valid. */
export function applyPlaceholders(
  text: string,
  results: RecognizerResult[],
  placeholderFor: (value: string, entityType: string) => string,
): string {
  const spans = resolveOverlaps(results)
  const replacements = spans.map((span) => placeholderFor(text.slice(span.start, span.end), span.entity_type))
  let output = text
  for (let i = spans.length - 1; i >= 0; i--) {
    output = output.slice(0, spans[i].start) + replacements[i] + output.slice(spans[i].end)
  }
  return output
}

/**
 * Pseudonymizes a set of named texts with one Presidio call.
 * Throws `PresidioError` if the service is down: callers must not fall back to sending raw data.
 */
export async function pseudonymizeTexts<K extends string>(
  texts: Record<K, string>,
  known: KnownEntity[] = [],
  entities: string[] = DEFAULT_ENTITIES,
): Promise<PseudonymizedTexts<K>> {
  const validKnown = known
    .map((entity) => ({ text: entity.text.trim(), label: entity.label }))
    .filter((entity) => entity.text.length >= 2 && LABEL_PATTERN.test(entity.label))
  const knownLabels = [...new Set(validKnown.map((entity) => entity.label))]
  const adHocRecognizers = knownLabels.map((label) => ({
    name: `known_${label.toLowerCase()}`,
    supported_language: LANGUAGE,
    supported_entity: label,
    deny_list: validKnown.filter((entity) => entity.label === label).map((entity) => entity.text),
  }))

  const keys = Object.keys(texts) as K[]
  const results = await analyzeTexts(
    keys.map((key) => texts[key]),
    { entities: [...entities, ...knownLabels], adHocRecognizers },
  )

  const table = createPlaceholderTable(validKnown)
  const output = {} as Record<K, string>
  keys.forEach((key, i) => {
    output[key] = applyPlaceholders(texts[key], results[i], table.placeholderFor)
  })
  return { texts: output, entities: table.entities() }
}

/** Puts the original values back into a text produced from pseudonymized input. */
export function reidentifyText(text: string, entities: EntityMapping[]): string {
  return entities.reduce((acc, { placeholder, original }) => acc.split(placeholder).join(original), text)
}

/** Applies `reidentifyText` to every string value of a flat record (e.g. a report's content). */
export function reidentifyRecord<T extends Record<string, string>>(record: T, entities: EntityMapping[]): T {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, reidentifyText(value, entities)]),
  ) as T
}
