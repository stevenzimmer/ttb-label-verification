import {z} from "zod";
import {LabelExtractionSchema} from "@/lib/label-extraction-schema";

export const ComparisonStatusSchema = z.enum(["match", "no_match", "review"]);

export const LabelMatchDecisionSchema = z.object({
    status: ComparisonStatusSchema,
    rationale: z.string().nullable(),
});

const labelMatchShape = {
    brand_name: LabelMatchDecisionSchema,
    class_type_designation: LabelMatchDecisionSchema,
    alcohol_content: LabelMatchDecisionSchema,
    net_contents: LabelMatchDecisionSchema,
    producer_name: LabelMatchDecisionSchema,
    producer_address: LabelMatchDecisionSchema,
    country_of_origin: LabelMatchDecisionSchema,
    gov_warning: LabelMatchDecisionSchema,
};

export const LabelComparisonSchema = z.object(labelMatchShape);

export const LabelExtractionWithComparisonSchema = z.object({
    extracted: LabelExtractionSchema,
    comparisons: LabelComparisonSchema,
});

type PartialLabelComparison = Partial<z.infer<typeof LabelComparisonSchema>>;

const emptyDecision = {
    status: "review" as const,
    rationale: "Insufficient information to confirm a match.",
};

const normalizeDecision = (
    decision: z.infer<typeof LabelMatchDecisionSchema>,
) => {
    if (decision.status === "match") {
        return {status: "match" as const, rationale: null};
    }
    const rationale = decision.rationale?.trim();
    if (rationale) {
        return {status: decision.status, rationale};
    }
    return {
        status: decision.status,
        rationale:
            decision.status === "review"
                ? "Insufficient information to confirm a match."
                : "Values do not match after normalization.",
    };
};

export const normalizeLabelComparisons = (data: PartialLabelComparison) => {
    return {
        brand_name: data.brand_name
            ? normalizeDecision(data.brand_name)
            : emptyDecision,
        class_type_designation: data.class_type_designation
            ? normalizeDecision(data.class_type_designation)
            : emptyDecision,
        alcohol_content: data.alcohol_content
            ? normalizeDecision(data.alcohol_content)
            : emptyDecision,
        net_contents: data.net_contents
            ? normalizeDecision(data.net_contents)
            : emptyDecision,
        producer_name: data.producer_name
            ? normalizeDecision(data.producer_name)
            : emptyDecision,
        producer_address: data.producer_address
            ? normalizeDecision(data.producer_address)
            : emptyDecision,
        country_of_origin: data.country_of_origin
            ? normalizeDecision(data.country_of_origin)
            : emptyDecision,
        gov_warning: data.gov_warning
            ? normalizeDecision(data.gov_warning)
            : emptyDecision,
    };
};

export type LabelComparison = z.infer<typeof LabelComparisonSchema>;
