import {X} from "lucide-react";
import {useLabelContext} from "@/components/label-context";
export const RejectionReasoning = () => {
    const {
        activeFileIndex,
        handleRejectionReasonChange,
        handleShowRejectionReasonAtIndex,
        rejectionReasonByFile,
    } = useLabelContext();
    const rejectionReason = rejectionReasonByFile[activeFileIndex] ?? "";
    return (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 relative">
            <button
                type="button"
                aria-label="Close rejection reasoning"
                className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white hover:text-slate-700"
                onClick={() =>
                    handleShowRejectionReasonAtIndex(activeFileIndex, false)
                }
            >
                <X className="h-4 w-4" />
            </button>
            <label className="flex flex-col gap-2 text-sm text-slate-700">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Rejection reasoning
                    <span className="text-red-600"> *</span>
                </span>
                <textarea
                    rows={3}
                    autoFocus
                    value={rejectionReason}
                    onChange={(event) =>
                        handleRejectionReasonChange(
                            activeFileIndex,
                            event.target.value,
                        )
                    }
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                    placeholder="Explain why this label is being rejected"
                />
                <span className="text-xs text-slate-500">
                    Required before you can reject this label.
                </span>
            </label>
        </div>
    );
};
