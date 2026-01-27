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

const emptyTextObject: z.infer<typeof textObject> = {
    value: null,
    confidence: 0,
    evidence: [],
};

const labelExtractionShape = {
    brand_name: textObject,
    class_type_designation: textObject,
    alcohol_content: textObject,
    net_contents: textObject,
    producer_name: textObject,
    producer_address: textObject,
    country_of_origin: textObject,
    gov_warning: textObject,
};

export const LabelExtractionSchema = z.object(labelExtractionShape);

type PartialLabelExtraction = Partial<z.infer<typeof LabelExtractionSchema>>;

export const normalizeLabelExtraction = (data: PartialLabelExtraction) => {
    return {
        brand_name: data.brand_name ?? emptyTextObject,
        class_type_designation: data.class_type_designation ?? emptyTextObject,
        alcohol_content: data.alcohol_content ?? emptyTextObject,
        net_contents: data.net_contents ?? emptyTextObject,
        producer_name: data.producer_name ?? emptyTextObject,
        producer_address: data.producer_address ?? emptyTextObject,
        country_of_origin: data.country_of_origin ?? emptyTextObject,
        gov_warning: data.gov_warning ?? emptyTextObject,
    };
};

export type LabelExtraction = z.infer<typeof LabelExtractionSchema>;
