"use client";

import {Button} from "@/components/ui/button";
import {useLabelContext} from "@/components/label-context";

export function LabelNav() {
    const {
        setIsDrawerOpen,
        setIsRejectedDrawerOpen,
        setIsIntroDrawerOpen,
    } = useLabelContext();
    return (
        <nav className="w-full border-b bg-white">
            <div className="mx-auto md:flex w-full max-w-7xl items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 mb-3 md:mb-0">
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
                    <button
                        type="button"
                        onClick={() => setIsIntroDrawerOpen(true)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                        aria-label="Open label validation introduction"
                    >
                        <svg
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                        >
                            <circle cx="10" cy="10" r="8" />
                            <path
                                strokeLinecap="round"
                                d="M10 8.2v5"
                            />
                            <circle cx="10" cy="5.6" r="0.9" />
                        </svg>
                    </button>
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
