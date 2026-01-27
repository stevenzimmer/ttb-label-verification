import * as React from "react";

import {cn} from "@/lib/utils";

type DrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
    side?: "right" | "bottom";
};

function Drawer({open, onOpenChange, children, side = "right"}: DrawerProps) {
    const [isMounted, setIsMounted] = React.useState(open);
    const [isVisible, setIsVisible] = React.useState(open);

    React.useEffect(() => {
        if (open) {
            setIsMounted(true);
            requestAnimationFrame(() => setIsVisible(true));
        } else {
            setIsVisible(false);
            const timeout = setTimeout(() => setIsMounted(false), 200);
            return () => clearTimeout(timeout);
        }
    }, [open]);

    if (!isMounted) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                aria-label="Close drawer"
                className={cn(
                    "absolute inset-0 bg-black/30 transition-opacity duration-200",
                    isVisible ? "opacity-100" : "opacity-0",
                )}
                onClick={() => onOpenChange(false)}
            />
            <div
                className={cn(
                    "absolute bg-card text-card-foreground shadow-xl transition-transform duration-200",
                    side === "bottom"
                        ? "inset-x-0 bottom-0 w-full max-h-[85vh] rounded-t-2xl"
                        : "inset-y-0 right-0 w-full max-w-md",
                    side === "bottom"
                        ? isVisible
                            ? "translate-y-0"
                            : "translate-y-full"
                        : isVisible
                          ? "translate-x-0"
                          : "translate-x-full",
                )}
            >
                {children}
            </div>
        </div>
    );
}

function DrawerHeader({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            className={cn("border-b px-6 py-4", className)}
            {...props}
        />
    );
}

function DrawerTitle({
    className,
    ...props
}: React.ComponentProps<"h2">) {
    return (
        <h2 className={cn("text-lg font-semibold", className)} {...props} />
    );
}

function DrawerContent({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return <div className={cn("p-6", className)} {...props} />;
}

export {Drawer, DrawerHeader, DrawerTitle, DrawerContent};
