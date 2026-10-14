import { Agent } from "@mastra/core/agent"
import { agent_intructions } from "./instructions";
import { aiReportSchema } from "./reportOutputSchema";
import { parseStoredContent, type ReportContent } from "@/lib/reportSchema";
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

export async function generateReportFromVisit(visit: Visit): Promise<GeneratedReport> {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        throw new ReportGenerationError("GOOGLE_GENERATIVE_AI_API_KEY env var not found.")
    }

    const inputFormat = {
        INTERVIEW_NOTES_AND_CRITERIA: visit.interviewNotes,
        SOCIOECONOMIC_DATA: visit.socioeconomicData,
        LIFE_HISTORY: visit.lifeHistory,
    }

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

    const content = parseStoredContent(JSON.stringify(parsed.data.content))
    const alert = parsed.data.riskAlert.trim()
    if (alert) {
        content.caseSummary = `⚠️ ALERTA: INDICADORES DE ALTO RIESGO DETECTADOS\n${alert}\n\n${content.caseSummary}`
    }

    return { title: parsed.data.title.trim().slice(0, 200), content }
}
