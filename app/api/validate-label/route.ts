import {NextRequest, NextResponse} from "next/server";
import OpenAI from "openai";
import {zodTextFormat} from "openai/helpers/zod";
import {
    LabelExtractionSchema,
    normalizeLabelExtraction,
} from "@/lib/label-extraction-schema";
import {
    LabelComparisonSchema,
    LabelExtractionWithComparisonSchema,
    normalizeLabelComparisons,
} from "@/lib/label-match-schema";
import {extractionWithMatchingSystemPrompt} from "@/lib/system-prompt";
import type {ApplicationData} from "@/lib/label-types";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const applicationDataRaw = formData.get("application_data");

    if (!file) {
        return NextResponse.json({error: "No file provided"}, {status: 400});
    }

    let applicationData: ApplicationData | null = null;
    if (typeof applicationDataRaw === "string" && applicationDataRaw.trim()) {
        try {
            applicationData = JSON.parse(applicationDataRaw) as ApplicationData;
        } catch (error) {
            return NextResponse.json(
                {error: "Invalid application data JSON"},
                {status: 400},
            );
        }
    }
    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    // Create proper data URL based on file type
    const mimeType = file.type || "image/jpeg"; // fallback to jpeg if type is not available
    const base64Url = `data:${mimeType};base64,${base64Image}`;

    try {
        const response = await client.responses.parse({
            model: "gpt-4o-mini",
            input: [
                {
                    role: "system",
                    content: extractionWithMatchingSystemPrompt,
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "input_image",
                            image_url: base64Url,
                            detail: "auto",
                        },
                        {
                            type: "input_text",
                            text: `Application data JSON:\n${JSON.stringify(
                                applicationData ?? {},
                            )}`,
                        },
                    ],
                },
            ],
            text: {
                format: zodTextFormat(
                    LabelExtractionWithComparisonSchema,
                    "label_extraction_with_matching",
                ),
            },
        });

        // 3) Parse the JSON result
        // In the Responses API, the structured output is returned as JSON content.
        const text = response.output_text;

        if (!text) {
            return NextResponse.json(
                {error: "No output from model"},
                {status: 500},
            );
        }
        const raw = JSON.parse(text) as Record<string, unknown>;
        const parsedOutput = LabelExtractionWithComparisonSchema.parse(raw);
        const withDefaults = normalizeLabelExtraction(
            parsedOutput.extracted as Partial<
                ReturnType<typeof normalizeLabelExtraction>
            >,
        );
        const comparisonDefaults = normalizeLabelComparisons(
            parsedOutput.comparisons as Partial<
                ReturnType<typeof normalizeLabelComparisons>
            >,
        );
        const extractedParsed = LabelExtractionSchema.parse(withDefaults);
        const normalized = Object.fromEntries(
            Object.entries(extractedParsed).map(([key, field]) => {
                const value =
                    typeof field.value === "string" && field.value.trim() === ""
                        ? null
                        : field.value;
                const evidence = Array.isArray(field.evidence)
                    ? field.evidence.filter((item) => item.trim() !== "")
                    : [];
                const confidence = Math.min(
                    1,
                    Math.max(0, Number(field.confidence) || 0),
                );
                return [key, {...field, value, evidence, confidence}];
            }),
        );
        const comparisonParsed = LabelComparisonSchema.parse(
            comparisonDefaults,
        );

        return NextResponse.json(
            {parsed: normalized, comparisons: comparisonParsed},
            {status: 200},
        );
    } catch (err) {
        return NextResponse.json(
            {error: (err as Error).message || "Error processing image"},
            {status: 500},
        );
    }
}
