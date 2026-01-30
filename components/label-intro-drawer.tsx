"use client";

import {Button} from "@/components/ui/button";
import {useLabelContext} from "@/components/label-context";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";

export function LabelIntroDrawer() {
    const {isIntroDrawerOpen, setIsIntroDrawerOpen} = useLabelContext();

    return (
        <Drawer
            open={isIntroDrawerOpen}
            onOpenChange={setIsIntroDrawerOpen}
            side="left"
        >
            <DrawerHeader className="flex items-center justify-between">
                <DrawerTitle>About label validation</DrawerTitle>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsIntroDrawerOpen(false)}
                >
                    Close
                </Button>
            </DrawerHeader>
            <DrawerContent className="space-y-6 text-sm text-slate-700">
                <div className="space-y-2">
                    <p className="text-base font-semibold text-slate-900">
                        What this tool does
                    </p>
                    <p>
                        This workspace helps reviewers compare alcohol label
                        images against application data. It extracts visible
                        text from uploaded labels, then highlights where the
                        label matches, needs review, or conflicts with the
                        application record.
                    </p>
                </div>
                <div className="space-y-2">
                    <p className="text-base font-semibold text-slate-900">
                        Quick start workflow
                    </p>
                    <ol className="list-decimal space-y-1 pl-4">
                        <li>Upload one or more label images.</li>
                        <li>Import application data (CSV or JSON).</li>
                        <li>Extract text from all labels.</li>
                        <li>
                            Review each label, then accept or reject with notes.
                        </li>
                    </ol>
                </div>
                <div className="space-y-2">
                    <p className="text-base font-semibold text-slate-900">
                        Data expectations
                    </p>
                    <ul className="list-disc space-y-1 pl-4">
                        <li>
                            Images should be clear, upright, and under 1MB per
                            file.
                        </li>
                        <li>
                            CSV/JSON should include label name, brand, class,
                            alcohol content, and bottler/producer details.
                        </li>
                        <li>
                            The system uses filename matching to associate data
                            with labels.
                        </li>
                    </ul>
                </div>
                <div className="space-y-2">
                    <p className="text-base font-semibold text-slate-900">
                        Tips for review
                    </p>
                    <ul className="list-disc space-y-1 pl-4">
                        <li>
                            Use the comparison panel to spot mismatches before
                            saving decisions.
                        </li>
                        <li>
                            Add rejection reasons for auditability and follow-up
                            clarity.
                        </li>
                    </ul>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
