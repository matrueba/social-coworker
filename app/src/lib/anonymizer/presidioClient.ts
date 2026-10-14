import axios, { AxiosError, type AxiosInstance } from 'axios'
import { z } from 'zod'

/**
 * HTTP client for the Presidio Analyzer container (see `presidio/` and ANONIMIZACION.md).
 * Server-only: the requests carry personal data and must never run in the browser.
 */

const DEFAULT_URL = 'http://localhost:5002'
const TIMEOUT_MS = 30_000
const MAX_RETRIES = 2
const RETRY_DELAY_MS = 500

export const LANGUAGE = 'es'

export class PresidioError extends Error {}

const recognizerResultSchema = z.object({
  entity_type: z.string(),
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
  score: z.number(),
})

const batchResponseSchema = z.array(z.array(recognizerResultSchema))

export type RecognizerResult = z.infer<typeof recognizerResultSchema>

/** Deny-list recognizer sent with the request, e.g. the name of the person the case is about. */
export interface AdHocDenyListRecognizer {
  name: string
  supported_language: string
  supported_entity: string
  deny_list: string[]
}

export interface AnalyzeOptions {
  entities: string[]
  adHocRecognizers?: AdHocDenyListRecognizer[]
  scoreThreshold?: number
}

let instance: AxiosInstance | null = null

function client(): AxiosInstance {
  instance ??= axios.create({
    baseURL: process.env.PRESIDIO_ANALYZER_URL || DEFAULT_URL,
    timeout: TIMEOUT_MS,
    headers: { 'Content-Type': 'application/json' },
  })
  return instance
}

function isRetryable(err: unknown): boolean {
  if (!(err instanceof AxiosError)) return false
  // Network error / timeout (no response) or server error.
  return !err.response || err.response.status >= 500
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Detects personal data in several texts with a single call to `POST /analyze`.
 * Returns one list of results per text, in the same order.
 */
export async function analyzeTexts(texts: string[], options: AnalyzeOptions): Promise<RecognizerResult[][]> {
  if (texts.length === 0) return []

  const body = {
    text: texts,
    language: LANGUAGE,
    entities: options.entities,
    ad_hoc_recognizers: options.adHocRecognizers ?? [],
    score_threshold: options.scoreThreshold,
  }

  for (let attempt = 0; ; attempt++) {
    try {
      const { data } = await client().post<unknown>('/analyze', body)
      const parsed = batchResponseSchema.safeParse(data)
      if (!parsed.success || parsed.data.length !== texts.length) {
        throw new PresidioError('Unexpected response from Presidio Analyzer')
      }
      return parsed.data
    } catch (err) {
      if (attempt < MAX_RETRIES && isRetryable(err)) {
        await sleep(RETRY_DELAY_MS * 2 ** attempt)
        continue
      }
      // Only log status/code: the request body contains personal data.
      const status = err instanceof AxiosError ? (err.response?.status ?? err.code) : undefined
      console.error(JSON.stringify({ event: 'presidio.analyze.failed', status, attempts: attempt + 1 }))
      if (err instanceof PresidioError) throw err
      throw new PresidioError('Presidio Analyzer is not available')
    }
  }
}
