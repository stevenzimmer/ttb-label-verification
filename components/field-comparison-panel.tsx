import {RejectionReasoning} from "./rejection-reasoning";
import {FieldComparisonTable} from "@/components/field-comparison-table";
import {Check, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useLabelContext} from "@/components/label-context";
export const FieldComparisonPanel = () => {
    const {
        activeFileIndex,
        isLoading,
        savingByFile,
        acceptedByFile,
        rejectedByFile,
        showRejectionReasonByFile,
        applicationDataByFile,
        rejectionReasonByFile,
        parsedData,
        parsedDataByFile,
        compareLabelToApplication,
        handleAcceptLabelAtIndex,
        handleRejectLabelAtIndex,
        handleUnacceptLabelAtIndex,
        handleUnrejectLabelAtIndex,
        handleShowRejectionReasonAtIndex,
    } = useLabelContext();
    const isRejected = rejectedByFile[activeFileIndex];
    const rejectionReason = rejectionReasonByFile[activeFileIndex] ?? "";
    const showRejectionReason = showRejectionReasonByFile[activeFileIndex];
    const canReject = rejectionReason.trim().length > 0;
    const applicationData = applicationDataByFile[activeFileIndex] ?? null;
    const currentData = parsedDataByFile[activeFileIndex] ?? parsedData ?? null;
    const comparisons = compareLabelToApplication(currentData, applicationData);

    const canAccept = Boolean(
        comparisons &&
            Object.values(comparisons)
                .filter((comparison) => comparison.required)
                .every((comparison) => comparison.status === "match"),
    );
    return (
        <div className="grid grid-cols-1 gap-6">
            {comparisons && (
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 text-black">
                    <FieldComparisonTable comparisons={comparisons} />
                    {!isRejected &&
                        !acceptedByFile[activeFileIndex] &&
                        showRejectionReason && <RejectionReasoning />}
                    <div className="mt-4 flex items-center justify-end gap-3">
                        {isRejected ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-red-600">
                                    Rejected
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isLoading}
                                    className="border-red-200 text-red-700 hover:bg-red-50"
                                    onClick={() =>
                                        handleUnrejectLabelAtIndex(
                                            activeFileIndex,
                                        )
                                    }
                                >
                                    Undo reject
                                </Button>
                            </div>
                        ) : (
                            <>
                                {!acceptedByFile[activeFileIndex] && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={
                                            isLoading ||
                                            savingByFile[activeFileIndex] ||
                                            (showRejectionReason && !canReject)
                                        }
                                        className="border-red-200 text-red-700 hover:bg-red-50"
                                        onClick={() =>
                                            !showRejectionReason
                                                ? handleShowRejectionReasonAtIndex(
                                                      activeFileIndex,
                                                      true,
                                                  )
                                                : void handleRejectLabelAtIndex(
                                                      activeFileIndex,
                                                  )
                                        }
                                    >
                                        {showRejectionReason
                                            ? "Confirm reject"
                                            : "Reject label"}
                                    </Button>
                                )}
                            </>
                        )}
                        <div className="">
                            {acceptedByFile[activeFileIndex] ? (
                                <button
                                    type="button"
                                    title="Remove from accepted"
                                    className="group inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 transition-colors hover:bg-red-100 hover:text-red-600"
                                    onClick={() =>
                                        handleUnacceptLabelAtIndex(
                                            activeFileIndex,
                                        )
                                    }
                                >
                                    <Check className="h-5 w-5 group-hover:hidden" />
                                    <X className="hidden h-5 w-5 group-hover:block" />
                                </button>
                            ) : (
                                <>
                                    {!isRejected && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            disabled={
                                                isLoading ||
                                                !canAccept ||
                                                savingByFile[activeFileIndex]
                                            }
                                            className="bg-slate-700 text-white hover:bg-slate-800"
                                            onClick={() =>
                                                void handleAcceptLabelAtIndex(
                                                    activeFileIndex,
                                                )
                                            }
                                        >
                                            {savingByFile[activeFileIndex]
                                                ? "Saving..."
                                                : "Accept label"}
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
