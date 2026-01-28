"use client";

import Image from "next/image";
import {Button} from "@/components/ui/button";
import {useLabelContext} from "@/components/label-context";
import {SkeletonPanel} from "./skeleton-panel";
import {FieldComparisonPanel} from "./field-comparison-panel";
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
        isPreviewDrawerOpen,
        setIsPreviewDrawerOpen,
        applicationDataByFile,
        applicationDataImportedByFile,
        compareLabelToApplication,
        handleLabelTextExtract,
    } = useLabelContext();

    const isValidating = validatingByFile[activeFileIndex];
    const currentData = parsedDataByFile[activeFileIndex] ?? parsedData ?? null;
    const applicationData = applicationDataByFile[activeFileIndex] ?? null;
    const isApplicationDataImported =
        applicationDataImportedByFile[activeFileIndex];
    const comparisons = compareLabelToApplication(currentData, applicationData);

    const filteredTimes = processingTimes.filter(
        (time) => time.labelName === selectedFile?.name,
    );

    const onlyShowRecentTime = filteredTimes.length - 1;
    const recentTime = filteredTimes[onlyShowRecentTime];
    return (
        <Drawer
            open={Boolean(
                isPreviewDrawerOpen && selectedFile && isApplicationDataImported,
            )}
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
                        {isValidating && <SkeletonPanel />}

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                                {error}
                            </div>
                        )}

                        {currentData && !isValidating ? (
                            <FieldComparisonPanel />
                        ) : (
                            <>
                                {!comparisons && !isValidating && (
                                    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 text-black space-y-4 text-center">
                                        <h2>
                                            Extract text from label to populate
                                            the comparison tables
                                        </h2>
                                        <div className="">
                                            <Button
                                                onClick={handleLabelTextExtract}
                                                disabled={isLoading}
                                                className="bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                                            >
                                                Extract text from label
                                            </Button>
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
