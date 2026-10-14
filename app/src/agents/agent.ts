import { Agent } from "@mastra/core/agent"
import { agent_intructions } from "./instructions";
import { aiReportSchema } from "./reportOutputSchema";
import { parseStoredContent, type ReportContent } from "@/lib/reportSchema";
import { PresidioError } from "@/lib/anonymizer/presidioClient";
import { pseudonymizeTexts, reidentifyRecord, reidentifyText, type EntityMapping } from "@/lib/anonymizer/pseudonymizer";
import type { Visit } from "@/lib/visitSchema";

const MODEL = process.env.MODEL || "google/gemini-3.6-flash"
export class ReportGenerationError extends Error { }

const reportAgent = new Agent({
    id: "report-agent",
    name: "Report Agent",
    instructions: agent_intructions,
    model: MODEL,
    maxRetries: 2
});

export interface GeneratedReport {
    title: string
    content: ReportContent
}

/**
 * Replaces personal data in the visit before it reaches the LLM. Fails closed: if Presidio
 * is down the report is not generated, unless ANONYMIZATION_DISABLED=true (local dev only).
 */
async function pseudonymizeVisit(visit: Visit) {
    const texts = {
        INTERVIEW_NOTES_AND_CRITERIA: visit.interviewNotes,
        SOCIOECONOMIC_DATA: visit.socioeconomicData,
        LIFE_HISTORY: visit.lifeHistory,
    }
    if (process.env.ANONYMIZATION_DISABLED === "true") {
        console.warn(JSON.stringify({ event: "anonymization.disabled", visitId: visit.id }))
        return { texts, entities: [] as EntityMapping[] }
    }
    try {
        return await pseudonymizeTexts(texts, [{ text: visit.clientName, label: "USUARIO" }])
    } catch (err) {
        if (err instanceof PresidioError) {
            throw new ReportGenerationError("El servicio de anonimización no está disponible. No se ha enviado ningún dato a la IA.")
        }
        throw err
    }
}

export async function generateReportFromVisit(visit: Visit): Promise<GeneratedReport> {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        throw new ReportGenerationError("GOOGLE_GENERATIVE_AI_API_KEY env var not found.")
    }

    const { texts: inputFormat, entities } = await pseudonymizeVisit(visit)

    const input = {
        role: "user" as const,
        content: "Este el el caso a trabajar: " + JSON.stringify(inputFormat)
    }

    const response = await reportAgent.generate([input], {
        structuredOutput: { schema: aiReportSchema },
        abortSignal: AbortSignal.timeout(4 * 60 * 1000),
    });

    const parsed = aiReportSchema.safeParse(response.object)
    if (!parsed.success) {
        throw new ReportGenerationError("Model returned an invalid report format. Please try again.")
    }

    const content = parseStoredContent(JSON.stringify(reidentifyRecord(parsed.data.content, entities)))
    const alert = reidentifyText(parsed.data.riskAlert, entities).trim()
    if (alert) {
        content.caseSummary = `⚠️ ALERTA: INDICADORES DE ALTO RIESGO DETECTADOS\n${alert}\n\n${content.caseSummary}`
    }

    const title = reidentifyText(parsed.data.title, entities).trim().slice(0, 200)
    return { title, content }
}
