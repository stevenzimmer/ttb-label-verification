"use client";

import {Card, CardContent} from "@/components/ui/card";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import {Button} from "@/components/ui/button";
import {useLabelContext} from "@/components/label-context";

export const AcceptedLabelsDrawer = () => {
    const {isDrawerOpen, setIsDrawerOpen, savedLabels} = useLabelContext();
    return (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerHeader className="flex items-center justify-between">
                <DrawerTitle>Accepted labels</DrawerTitle>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDrawerOpen(false)}
                >
                    Close
                </Button>
            </DrawerHeader>
            <DrawerContent>
                {savedLabels.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No accepted labels yet.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {savedLabels.map((record, index) => (
                            <Card key={`${record.file.name}-${index}`}>
                                <CardContent className="space-y-2 p-4 text-sm">
                                    <div className="font-medium">
                                        {record.file.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {(record.file.size / 1024).toFixed(2)}{" "}
                                        KB · Saved {record.savedAt}
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
