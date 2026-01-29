"use client";
import {AcceptedLabelsDrawer} from "@/components/accepted-labels-drawer";
import {RejectedLabelsDrawer} from "@/components/rejected-labels-drawer";
import {useLabelContext} from "@/components/label-context";
import {LabelCards} from "@/components/label-cards";
import {LabelValidationWorkflow} from "@/components/label-validation-workflow";
import {LabelExtractionDrawer} from "@/components/label-extraction-drawer";
export const LabelValidationWrapper = () => {
    const {uploadedFiles} = useLabelContext();

    return (
        <div className="px-3 lg:px-0">
            <AcceptedLabelsDrawer />
            <RejectedLabelsDrawer />
            <LabelExtractionDrawer />
            <div className="max-w-3xl mx-auto py-16">
                <LabelValidationWorkflow />
                {uploadedFiles.length > 0 && <LabelCards />}
            </div>
        </div>
    );
};
