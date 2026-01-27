import type {LabelExtraction} from "@/lib/label-extraction-schema";

export interface SavedLabelRecord {
    file: {
        name: string;
        size: number;
        type: string;
        lastModified: number;
    };
    extracted: LabelExtraction;
    savedAt: string;
}

export interface RejectedLabelRecord {
    file: {
        name: string;
        size: number;
        type: string;
        lastModified: number;
    };
    extracted: LabelExtraction;
    rejectedAt: string;
}

export interface ApplicationData {
    brand_name: string;
    class_type_designation: string;
    alcohol_content: string;
    net_contents: string;
    producer_name: string;
    producer_address: string;
    country_of_origin: string;
    gov_warning: string;
}

export type ComparisonStatus = "match" | "review" | "issue";

export interface LabelFieldComparison {
    labelValue: string | null;
    applicationValue: string;
    status: ComparisonStatus;
    required: boolean;
    requirementReason: string;
}

export interface LabelMatchSummary {
    matched: number;
    total: number;
    allMatched: boolean;
    reviewFields: string[];
    issueFields: string[];
}
