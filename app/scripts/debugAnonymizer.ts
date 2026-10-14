/**
 * Runs the pseudonymizer against the Presidio container, without calling the LLM.
 *
 *   docker compose up -d presidio-analyzer   (from the repo root)
 *   npx tsx scripts/debugAnonymizer.ts
 *
 * Launch it from VS Code: "Depurar anonimización (Presidio)".
 */
import { pseudonymizeTexts, reidentifyText } from '@/lib/anonymizer/pseudonymizer'

const SAMPLE = {
  notes: `Carmen Ruiz Delgado (DNI 12345678Z) acude acompañada de su sobrino Javier Martínez López,
que la visita una vez al mes. Teléfono de contacto 612 345 678, correo carmen.ruiz@example.com.
Vive sola en Calle Feria 23, 2º B, de Sevilla. Mujer de 80 años, limitaciones cognitivas.`,
  socioeconomic: 'Pensión de viudedad de 750 € ingresada en ES91 2100 0418 4502 0005 1332. NSS 28/12345678/40.',
  history: 'Carmen enviudó en 2025. Javier Martínez López es su único familiar.',
}

async function main() {
  const result = await pseudonymizeTexts(SAMPLE, [{ text: 'Carmen Ruiz Delgado', label: 'USUARIO' }])
  console.log('--- Textos seudonimizados ---')
  console.log(JSON.stringify(result.texts, null, 2))
  console.log('--- Tabla de correspondencias ---')
  console.table(result.entities)
  console.log('--- Reidentificación ---')
  console.log(reidentifyText(result.texts.notes, result.entities) === SAMPLE.notes ? 'OK: notes restaurado' : 'DIFERENCIAS en notes')
}

main().catch((err: unknown) => {
  console.error(err)
  process.exitCode = 1
})
