"use client";

import Image from "next/image";
import {Button} from "@/components/ui/button";
import {Check, X} from "lucide-react";
import {useLabelContext} from "@/components/label-context";
import {FieldByFieldComparisonTable} from "@/components/field-by-field-comparison-table";
import {Skeleton} from "@/components/ui/skeleton";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";

export function LabelExtractionDrawer() {
    const {
        selectedFile,
        previewUrl,
        parsedData,
        parsedDataByFile,
        validatingByFile,
        activeFileIndex,
        isLoading,
        processingTimes,
        error,
        savingByFile,
        acceptedByFile,
        rejectedByFile,
        isPreviewDrawerOpen,
        setIsPreviewDrawerOpen,
        applicationDataByFile,
        compareLabelToApplication,
        handleAcceptLabelAtIndex,
        handleRejectLabelAtIndex,
        handleUnacceptLabelAtIndex,
        handleUnrejectLabelAtIndex,
        handleLabelValidate,
    } = useLabelContext();

    const isValidating = validatingByFile[activeFileIndex];
    const currentData = parsedDataByFile[activeFileIndex] ?? parsedData ?? null;

    const isRejected = rejectedByFile[activeFileIndex];
    const applicationData = applicationDataByFile[activeFileIndex] ?? null;
    const comparisons = compareLabelToApplication(currentData, applicationData);

    const canAccept = Boolean(
        comparisons &&
            Object.values(comparisons)
                .filter((comparison) => comparison.required)
                .every((comparison) => comparison.status === "match"),
    );

    const filteredTimes = processingTimes.filter(
        (time) => time.labelName === selectedFile?.name,
    );

    const onlyShowRecentTime = filteredTimes.length - 1;
    const recentTime = filteredTimes[onlyShowRecentTime];
    return (
        <Drawer
            open={Boolean(isPreviewDrawerOpen && selectedFile)}
            onOpenChange={setIsPreviewDrawerOpen}
            side="bottom"
        >
            <DrawerHeader className="flex items-center justify-between">
                <DrawerTitle>
                    <div className="flex items-center">
                        <div>
                            <div>{selectedFile?.name ?? "Label details"}</div>
                            {filteredTimes.length > 0 && (
                                <div>
                                    <p className="text-lg font-semibold">
                                        Text extraction processing Time:{" "}
                                        <span className="text-gray-600 text-sm">
                                            {recentTime.duration.toFixed(1)}s
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>
                        {!currentData && !isValidating ? (
                            <></>
                        ) : (
                            <>
                                {!isValidating && (
                                    <div className="mx-6">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            disabled={isLoading}
                                            className="bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                                            onClick={handleLabelValidate}
                                        >
                                            Re-extract label text
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </DrawerTitle>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPreviewDrawerOpen(false)}
                >
                    Close
                </Button>
            </DrawerHeader>
            <DrawerContent className="max-h-[80vh] overflow-y-auto pb-44 lg:pb-20">
                <div className="lg:grid lg:grid-cols-3 gap-6">
                    {previewUrl && (
                        <div className="rounded-lg overflow-hidden">
                            <Image
                                src={previewUrl}
                                alt={`Preview of ${selectedFile?.name}`}
                                width={1000}
                                height={1000}
                                className="object-contain w-full h-auto block mx-auto"
                            />
                        </div>
                    )}

                    <div className="col-span-2">
                        {isValidating && (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                <p className="mt-2 text-sm text-gray-600">
                                    Processing...
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                                {error}
                            </div>
                        )}

                        {currentData && !isValidating ? (
                            <div className="grid grid-cols-1 gap-6">
                                {comparisons && (
                                    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 text-black">
                                        <FieldByFieldComparisonTable
                                            comparisons={comparisons}
                                        />
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
                                                    {!acceptedByFile[
                                                        activeFileIndex
                                                    ] && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            disabled={isLoading}
                                                            className="border-red-200 text-red-700 hover:bg-red-50"
                                                            onClick={() =>
                                                                void handleRejectLabelAtIndex(
                                                                    activeFileIndex,
                                                                )
                                                            }
                                                        >
                                                            Reject label
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                            <div className="">
                                                {acceptedByFile[
                                                    activeFileIndex
                                                ] ? (
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
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        disabled={
                                                            isLoading ||
                                                            isRejected ||
                                                            !canAccept ||
                                                            savingByFile[
                                                                activeFileIndex
                                                            ]
                                                        }
                                                        className="bg-slate-700 text-white hover:bg-slate-800"
                                                        onClick={() =>
                                                            void handleAcceptLabelAtIndex(
                                                                activeFileIndex,
                                                            )
                                                        }
                                                    >
                                                        {savingByFile[
                                                            activeFileIndex
                                                        ]
                                                            ? "Saving..."
                                                            : "Accept label"}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {!comparisons && (
                                    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 text-black space-y-4">
                                        <h2>
                                            Extract text from label to populate
                                            the tables
                                        </h2>
                                        <div className="">
                                            <Button
                                                onClick={handleLabelValidate}
                                                disabled={isLoading}
                                                className="bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                                            >
                                                Extract text from label
                                            </Button>
                                        </div>
                                        <Skeleton className="h-5 w-48" />
                                        <div className="space-y-3">
                                            {Array.from({length: 6}).map(
                                                (_, i) => (
                                                    <div
                                                        key={i}
                                                        className="grid grid-cols-4 gap-3"
                                                    >
                                                        <Skeleton className="h-4 w-full col-span-1" />
                                                        <Skeleton className="h-4 w-full col-span-1" />
                                                        <Skeleton className="h-10 w-full col-span-1" />
                                                        <Skeleton className="h-4 w-full col-span-1" />
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                        <div className="flex items-center justify-end gap-3">
                                            <Skeleton className="h-10 w-28" />
                                            <Skeleton className="h-10 w-28" />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
