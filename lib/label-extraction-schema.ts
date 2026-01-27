import {z} from "zod";

const confidenceType = z
    .number()
    .min(0)
    .max(1);
const textArray = z.array(z.string());

const textObject = z.object({
    value: z.string().nullable(),
    confidence: confidenceType,
    evidence: textArray,
});

export const LabelExtractionSchema = z.object({
    brand_name: textObject,
    class_type_designation: textObject,
    alcohol_content: textObject,
    net_contents: textObject,
    producer_name: textObject,
    producer_address: textObject,
    country_of_origin: textObject,
    gov_warning: textObject,
});

export type LabelExtraction = z.infer<typeof LabelExtractionSchema>;
