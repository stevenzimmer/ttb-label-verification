import type {ApplicationData} from "@/lib/label-types";
import type {LabelExtraction} from "@/lib/label-extraction-schema";

export type BeverageType = "beer" | "wine" | "spirit" | "unknown";

export interface RequirementContext {
  beverageType: BeverageType;
  isImported: boolean;
  abvPercent: number | null;
  hasAlcoholClaim: boolean;
}

export interface FieldRequirement {
  required: boolean;
  reason: string;
}

const USA_PATTERNS = ["usa", "us", "united states", "u.s."];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9%]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const parseAbvPercent = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }
  const match = value.match(/(\d+(?:\.\d+)?)\s*%/);
  if (!match) {
    return null;
  }
  const parsed = Number.parseFloat(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
};

export const inferBeverageType = (
  applicationData: ApplicationData,
  labelData: LabelExtraction | null,
): BeverageType => {
  const classType = normalize(applicationData.class_type_designation);
  const labelClassType = normalize(labelData?.class_type_designation.value ?? "");
  const combined = `${classType} ${labelClassType}`.trim();

  if (/(bourbon|whiskey|whisky|vodka|rum|gin|tequila|mezcal|brandy|cognac|distilled|distill(ed|ery)|spirit)/.test(combined)) {
    return "spirit";
  }
  if (/(wine|merlot|cabernet|pinot|chardonnay|sauvignon|riesling|zinfandel|rose|ros\u00e9|sparkling|prosecco|champagne)/.test(combined)) {
    return "wine";
  }
  if (/(beer|ale|lager|stout|porter|ipa|pilsner|pale ale|malt)/.test(combined)) {
    return "beer";
  }

  return "unknown";
};

export const inferIsImported = (applicationData: ApplicationData) => {
  const country = normalize(applicationData.country_of_origin);
  if (!country) {
    return false;
  }
  return !USA_PATTERNS.some((pattern) => country.includes(pattern));
};

export const hasAlcoholClaim = (
  applicationData: ApplicationData,
  labelData: LabelExtraction | null,
) => {
  const appAlcohol = applicationData.alcohol_content;
  const labelAlcohol = labelData?.alcohol_content.value ?? "";
  const classType = applicationData.class_type_designation;
  const labelClassType = labelData?.class_type_designation.value ?? "";
  const combined = `${appAlcohol} ${labelAlcohol} ${classType} ${labelClassType}`;
  return /(\d+(?:\.\d+)?\s*%|alc\.?\/?\s*vol|alcohol by volume|abv|proof)/i.test(combined);
};

export const buildRequirementContext = (
  applicationData: ApplicationData,
  labelData: LabelExtraction | null,
): RequirementContext => {
  const beverageType = inferBeverageType(applicationData, labelData);
  const isImported = inferIsImported(applicationData);
  const abvPercent =
    parseAbvPercent(applicationData.alcohol_content) ??
    parseAbvPercent(labelData?.alcohol_content.value);
  const alcoholClaim = hasAlcoholClaim(applicationData, labelData);

  return {
    beverageType,
    isImported,
    abvPercent,
    hasAlcoholClaim: alcoholClaim,
  };
};

export const getFieldRequirements = (
  context: RequirementContext,
): Record<keyof ApplicationData, FieldRequirement> => {
  const alwaysRequired: Array<keyof ApplicationData> = [
    "brand_name",
    "class_type_designation",
    "net_contents",
    "producer_name",
    "producer_address",
    "gov_warning",
  ];

  const requirements = Object.fromEntries(
    ([
      "brand_name",
      "class_type_designation",
      "alcohol_content",
      "net_contents",
      "producer_name",
      "producer_address",
      "country_of_origin",
      "gov_warning",
    ] as Array<keyof ApplicationData>).map((key) => [
      key,
      {required: false, reason: "Optional by default."},
    ]),
  ) as Record<keyof ApplicationData, FieldRequirement>;

  alwaysRequired.forEach((key) => {
    requirements[key] = {
      required: true,
      reason: "Required for all beverages.",
    };
  });

  if (context.isImported) {
    requirements.country_of_origin = {
      required: true,
      reason: "Required for imported beverages.",
    };
  } else {
    requirements.country_of_origin = {
      required: false,
      reason: "Optional for domestic beverages.",
    };
  }

  const isSpirit = context.beverageType === "spirit";
  const isWine = context.beverageType === "wine";
  const wineNeedsAbv = isWine && context.abvPercent !== null && context.abvPercent >= 14;
  const alcoholClaimNeedsAbv = context.hasAlcoholClaim;

  if (isSpirit || wineNeedsAbv || alcoholClaimNeedsAbv) {
    const reasonParts: string[] = [];
    if (isSpirit) {
      reasonParts.push("Required for distilled spirits.");
    }
    if (wineNeedsAbv) {
      reasonParts.push("Required for wine at or above 14% ABV.");
    }
    if (!isSpirit && !wineNeedsAbv && alcoholClaimNeedsAbv) {
      reasonParts.push("Required because an alcohol claim is present.");
    }
    requirements.alcohol_content = {
      required: true,
      reason: reasonParts.join(" ") || "Conditionally required.",
    };
  } else if (isWine) {
    requirements.alcohol_content = {
      required: false,
      reason: "Optional for wine below 14% ABV when no alcohol claim is made.",
    };
  } else if (context.beverageType === "beer") {
    requirements.alcohol_content = {
      required: false,
      reason: "Optional for beer unless an alcohol claim is made.",
    };
  } else {
    requirements.alcohol_content = {
      required: false,
      reason: "Optional unless conditions make it required.",
    };
  }

  return requirements;
};
