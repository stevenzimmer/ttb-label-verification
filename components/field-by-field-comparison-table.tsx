import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {formatFieldName} from "@/lib/format-label";
import type {ApplicationData, LabelFieldComparison} from "@/lib/label-types";
import {useLabelContext} from "@/components/label-context";
import {AlertTriangle, XCircle} from "lucide-react";

export const FieldByFieldComparisonTable = ({
    comparisons,
}: {
    comparisons: Record<string, LabelFieldComparison>;
}) => {
    const {
        activeFileIndex,
        applicationDataByFile,
        handleApplicationDataChange,
        parsedDataByFile,
        getLabelMatchSummary,
    } = useLabelContext();
    const applicationData = applicationDataByFile[activeFileIndex] ?? null;
    const summary = getLabelMatchSummary(parsedDataByFile[activeFileIndex] ?? null);
    const reviewFields = new Set(summary?.reviewFields ?? []);
    const issueFields = new Set(summary?.issueFields ?? []);
    return (
        <div className="mt-6">
            <h4 className="text-base font-semibold mb-2">
                Field-by-field comparison
            </h4>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-1/4">Field</TableHead>
                        <TableHead className="w-1/3">Extracted</TableHead>
                        <TableHead className="w-1/3">Application</TableHead>
                        <TableHead className="w-1/6">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Object.entries(comparisons).map(([key, comparison]) => {
                        const isIssue = issueFields.has(key);
                        const isReview = reviewFields.has(key);
                        const toneClass = isIssue
                            ? "text-red-700"
                            : isReview
                              ? "text-amber-700"
                              : "";
                        const Icon = isIssue ? XCircle : isReview ? AlertTriangle : null;
                        const iconLabel = isIssue ? "Issue" : isReview ? "Review" : undefined;
                        const applicationValue =
                            applicationData?.[key as keyof ApplicationData] ?? "";
                        const isApplicationEmpty = applicationValue.trim() === "";
                        const isGovWarning = key === "gov_warning";
                        return (
                            <TableRow key={key}>
                                <TableCell className="font-medium whitespace-normal wrap-break-word">
                                    <div
                                        className={`flex items-center gap-2 ${toneClass}`}
                                        title={iconLabel}
                                    >
                                        <span>{formatFieldName(key)}</span>
                                        {Icon && (
                                            <Icon className="h-4 w-4 shrink-0" />
                                        )}
                                        
                                    </div>
                                </TableCell>
                            <TableCell className="whitespace-normal wrap-break-word">
                                {comparison.labelValue ?? "—"}
                            </TableCell>
                            <TableCell className="whitespace-normal wrap-break-word">
                                {isGovWarning ? (
                                    <span
                                        className={
                                            comparison.status === "match"
                                                ? "text-emerald-700"
                                                : "text-red-700"
                                        }
                                        title={
                                            comparison.status === "match"
                                                ? "GOVERNMENT WARNING: found"
                                                : "GOVERNMENT WARNING: missing"
                                        }
                                    >
                                        {comparison.status === "match"
                                            ? "✅ Prefix Present"
                                            : "❌ Prefix Missing"}
                                    </span>
                                ) : (
                                    <input
                                        type="text"
                                        value={applicationValue}
                                        onChange={(event) =>
                                            handleApplicationDataChange(
                                                activeFileIndex,
                                                key as keyof ApplicationData,
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                                        placeholder="Enter application value"
                                    />
                                )}
                            </TableCell>
                            <TableCell>
                                {isGovWarning
                                    ? comparison.status === "match"
                                        ? "✅ Match"
                                        : "❌ Issue"
                                    : !isApplicationEmpty &&
                                      (comparison.status === "match"
                                          ? "✅ Match"
                                          : comparison.status === "review"
                                            ? "⚠️ Review"
                                            : "❌ Issue")}
                            </TableCell>
                        </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};
