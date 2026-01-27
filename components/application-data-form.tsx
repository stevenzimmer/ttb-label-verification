import {useLabelContext} from "./label-context";
import {formatFieldName} from "@/lib/format-label";
import type {ApplicationData, LabelFieldComparison} from "@/lib/label-types";

export const ApplicationDataForm = ({comparisons}: {
    comparisons: Record<string, LabelFieldComparison>
}) => {
    const {
        getComparisonSummary,
        handleApplicationDataChange,
        activeFileIndex,
        applicationDataByFile,
    } = useLabelContext();

    const comparisonSummary = getComparisonSummary(comparisons);
    const applicationData = applicationDataByFile[activeFileIndex] ?? null;
    const applicationDataKeys: Array<keyof ApplicationData> = [
        "brand_name",
        "class_type_designation",
        "alcohol_content",
        "net_contents",
        "producer_name",
        "producer_address",
        "country_of_origin",
        "gov_warning",
    ];
    return (
        <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold">
                    Application Data 
                </h4>
                {comparisonSummary && (
                    <span className="text-sm text-muted-foreground">
                        {comparisonSummary.matched}/{comparisonSummary.total}{" "}
                        matched
                    </span>
                )}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
                {applicationDataKeys.map((fieldKey) => (
                    <label
                        key={fieldKey}
                        className="flex flex-col gap-1 text-sm"
                    >
                        <span className="text-xs font-medium text-muted-foreground">
                            {formatFieldName(fieldKey)}
                        </span>
                        <input
                            type="text"
                            value={applicationData?.[fieldKey] ?? ""}
                            onChange={(event) =>
                                handleApplicationDataChange(
                                    activeFileIndex,
                                    fieldKey,
                                    event.target.value,
                                )
                            }
                            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                            placeholder="Enter application value"
                        />
                    </label>
                ))}
            </div>
        </div>
    );
};
