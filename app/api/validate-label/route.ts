import {NextRequest, NextResponse} from "next/server";
import OpenAI from "openai";
import {zodTextFormat} from "openai/helpers/zod";
import {LabelExtractionSchema} from "@/lib/label-extraction-schema";
import {systemPrompt} from "@/lib/system-prompt";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    // const { ocrText } = await request.json();
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
        return NextResponse.json({error: "No file provided"}, {status: 400});
    }
    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    // Create proper data URL based on file type
    const mimeType = file.type || "image/jpeg"; // fallback to jpeg if type is not available
    const base64Url = `data:${mimeType};base64,${base64Image}`;

    // console.log({ocrText});
    try {
        const response = await client.responses.parse({
            model: "gpt-4o-mini",
            input: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "input_image",
                            image_url: base64Url,
                            detail: "high",
                        },
                    ],
                },
            ],
            text: {
                format: zodTextFormat(
                    LabelExtractionSchema,
                    "label_extraction",
                ),
            },
        });

        // 3) Parse the JSON result
        // In the Responses API, the structured output is returned as JSON content.
        console.log({response});
        const text = response.output_text;

        if (!text) {
            return NextResponse.json(
                {error: "No output from model"},
                {status: 500},
            );
        }
        const parsed = JSON.parse(text);

        return NextResponse.json({parsed}, {status: 200});
    } catch (err) {
        return NextResponse.json(
            {error: (err as Error).message || "Error processing image"},
            {status: 500},
        );
    }
}
