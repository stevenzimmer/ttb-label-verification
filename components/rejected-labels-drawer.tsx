"use client";

import {Card, CardContent} from "@/components/ui/card";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import {useLabelContext} from "@/components/label-context";

export const RejectedLabelsDrawer = () => {
    const {
        isRejectedDrawerOpen,
        setIsRejectedDrawerOpen,
        rejectedLabels,
    } = useLabelContext();
    return (
        <Drawer
            open={isRejectedDrawerOpen}
            onOpenChange={setIsRejectedDrawerOpen}
        >
            <DrawerHeader>
                <DrawerTitle>Rejected labels</DrawerTitle>
            </DrawerHeader>
            <DrawerContent>
                {rejectedLabels.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No rejected labels yet.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {rejectedLabels.map((record, index) => (
                            <Card key={`${record.file.name}-${index}`}>
                                <CardContent className="space-y-2 p-4 text-sm">
                                    <div className="font-medium">
                                        {record.file.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {(record.file.size / 1024).toFixed(2)}{" "}
                                        KB · Rejected {record.rejectedAt}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Brand:{" "}
                                        {record.extracted.brand_name.value} ·
                                        Type:{" "}
                                        {
                                            record.extracted
                                                .class_type_designation.value
                                        }
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </DrawerContent>
        </Drawer>
    );
};
