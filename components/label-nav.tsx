"use client";

import {Button} from "@/components/ui/button";
import {useLabelContext} from "@/components/label-context";

export function LabelNav() {
    const {setIsDrawerOpen, setIsRejectedDrawerOpen} = useLabelContext();
    return (
        <nav className="w-full border-b bg-white">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-xs font-semibold text-white">
                        TTB
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Label Validator</p>
                        <p className="text-xs text-muted-foreground">
                            Internal review workspace
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDrawerOpen(true)}
                        className="text-green-700 border-green-700"
                    >
                        Accepted labels
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsRejectedDrawerOpen(true)}
                        className="border-red-700 text-red-700"
                    >
                        Rejected labels
                    </Button>
                </div>
            </div>
        </nav>
    );
}
