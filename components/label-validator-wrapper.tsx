"use client";
import {AcceptedLabelsDrawer} from "@/components/accepted-labels-drawer";
import {RejectedLabelsDrawer} from "@/components/rejected-labels-drawer";
import {useLabelContext} from "@/components/label-context";
import {LabelCards} from "@/components/label-cards";
import {LabelVerificationWorkflow} from "@/components/label-verification-workflow";
import {LabelExtractionDrawer} from "@/components/label-extraction-drawer";
export const LabelValidatorWrapper = () => {
    const {uploadedFiles} = useLabelContext();

    return (
        <div className="w-full">
            <AcceptedLabelsDrawer />
            <RejectedLabelsDrawer />
            <LabelExtractionDrawer />
            {/* Upload Section */}
            <div className="max-w-3xl mx-auto py-16">
                <LabelVerificationWorkflow />
                {uploadedFiles.length > 0 && <LabelCards />}
            </div>
        </div>
    );
};
