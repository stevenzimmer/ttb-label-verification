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
import {buildRequirementContext} from "@/lib/label-requirements";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export const FieldComparisonTable = ({
    comparisons,
}: {
    comparisons: Record<string, LabelFieldComparison>;
}) => {
    const {
        activeFileIndex,
        applicationDataByFile,
        applicationDataImportedByFile,
        handleApplicationDataChange,
        parsedDataByFile,
        getLabelMatchSummary,
        rejectedByFile
    } = useLabelContext();
    const applicationData = applicationDataByFile[activeFileIndex] ?? null;
    const isApplicationDataImported =
        applicationDataImportedByFile[activeFileIndex];
    const labelData = parsedDataByFile[activeFileIndex] ?? null;
    const requirementContext = applicationData
        ? buildRequirementContext( labelData)
        : null;
    const beverageTypeLabel = requirementContext
        ? requirementContext.beverageType === "unknown"
            ? "Unknown type"
            : requirementContext.beverageType[0].toUpperCase() +
              requirementContext.beverageType.slice(1)
        : null;
    const originLabel = requirementContext
        ? requirementContext.isImported
            ? "Imported"
            : "Domestic"
        : null;
    const summary = getLabelMatchSummary(
        labelData,
        applicationData,
        comparisons,
    );
    const reviewFields = new Set(summary?.reviewFields ?? []);
    const noMatchFields = new Set(summary?.noMatchFields ?? []);
    const formatStatus = (status: string) =>
        status === "no_match"
            ? "No match"
            : status.charAt(0).toUpperCase() + status.slice(1);
    return (
        <div className="mt-6">
            <div className="mb-2 flex flex-wrap items-center gap-2">
                <h4 className="text-base font-semibold">
                    Extracted Label text with application data comparison
                </h4>
                {beverageTypeLabel && originLabel && (
                    <>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                            {beverageTypeLabel}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                            {originLabel}
                        </span>
                    </>
                )}
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-1/4">Field</TableHead>
                        <TableHead className="w-1/3">Extracted text</TableHead>
                        <TableHead className="w-1/3">Application data</TableHead>
                        <TableHead className="w-1/6">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TooltipProvider>
                <TableBody>
                    {Object.entries(comparisons).map(([key, comparison]) => {
                        const isNoMatch = noMatchFields.has(key);
                        const isReview = reviewFields.has(key);
                        const toneClass = isNoMatch
                            ? "text-red-700"
                            : isReview
                              ? "text-amber-700"
                              : "";
                        const Icon = isNoMatch ? XCircle : isReview ? AlertTriangle : null;
                        const iconLabel = isNoMatch ? "No match" : isReview ? "Review" : undefined;
                        const applicationValue =
                            applicationData?.[key as keyof ApplicationData] ?? "";
                        const isGovWarning = key === "gov_warning";
                        const requirementLabel = comparison.required ? "Required" : "Optional";
                        const isRejected = rejectedByFile[activeFileIndex];
                        const isInputLocked = isRejected || isApplicationDataImported;
                        return (
                            <TableRow key={key}>
                                <TableCell className="font-medium whitespace-normal wrap-break-word">
                                    <div
                                        className={`flex items-center gap-2 ${toneClass}`}
                                        title={iconLabel}
                                    >
                                        <span>{formatFieldName(key)}</span>
                                        <span
                                            className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-600"
                                            title={comparison.requirementReason}
                                        >
                                            {requirementLabel}
                                        </span>
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
                                            ? "✅ Present"
                                            : "❌ Missing"}
                                    </span>
                                ) : isInputLocked ? (
                                    <span className="text-sm text-slate-900">
                                        {applicationValue.trim() || "—"}
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
                                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none disabled:bg-slate-100"
                                        placeholder="Enter application value"
                                        disabled={isInputLocked}
                                    />
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span>{formatStatus(comparison.status)}</span>
                                    {comparison.status !== "match" && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="inline-flex h-5 w-5 items-center justify-center text-slate-600">
                                                    {comparison.status === "review" ? (
                                                        <AlertTriangle className="h-4 w-4" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4" />
                                                    )}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                {comparison.rationale ??
                                                    "Insufficient information to confirm a match."}
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                        );
                    })}
                </TableBody>
                </TooltipProvider>
            </Table>
        </div>
    );
};
