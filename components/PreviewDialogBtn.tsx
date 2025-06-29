"use client";

import React, { useState } from "react";
import { Eye, Settings2 } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import useDesigner from "./hooks/useDesigner";
import GlobalSettingsDialog from "./GlobalSettingsPanel";
import { FormElements } from "./FormElements";

function PreviewDialogBtn() {
  const { elements, globalSettings } = useDesigner();
  const [showSettings, setShowSettings] = useState(false);

  // Ensure elements is always an array
  const safeElements = Array.isArray(elements) ? elements : [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Eye className="h-6 w-6" />
          Preview
        </Button>
      </DialogTrigger>

      <DialogContent className="flex h-screen max-h-screen w-screen max-w-full flex-col gap-0 p-0">
        {/* Header */}
        <div className="grid grid-cols-2 items-center border-b px-4 py-2">
          <div>
            <p className="text-lg font-bold text-muted-foreground">Form preview</p>
            <p className="text-sm text-muted-foreground">
              This is how your form will look to your users.
            </p>
          </div>

          <div className="flex justify-end mr-16">
            <Button variant="ghost" onClick={() => setShowSettings(true)}>
              <Settings2 className="w-5 h-5" />
              <span className="ml-2 text-sm">Global Settings</span>
            </Button>
          </div>
        </div>

        {/* Form Preview */}
        <div
          className="overflow-y-auto bg-accent bg-[url(/paper.svg)] dark:bg-[url(/paper-dark.svg)]"
          style={{ height: "calc(100vh - 100px)" }}
        >
          <div
            className="grid grid-cols-12 gap-4 p-8 rounded-2xl"
            style={{
              backgroundColor: globalSettings?.backgroundColor || "#ffffff",
              borderRadius: globalSettings?.borderRadius || "12px",
            }}
          >
            {safeElements.length === 0 ? (
              <p className="col-span-12 text-center text-muted-foreground">
                No elements to preview.
              </p>
            ) : (
              safeElements.map((element) => {
                const type = element.type as keyof typeof FormElements;
                const FormComponent = FormElements[type]?.formComponent;
                if (!FormComponent) return null;

                return (
                  <div
                    key={element.id}
                    className={`col-span-${(element.extraAttributes as any)?.size === "small"
                      ? 3
                      : (element.extraAttributes as any)?.size === "medium"
                        ? 6
                        : 12
                      }`}
                  >
                    <FormComponent elementInstance={element} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>

      {/* Global Settings Modal */}
      <GlobalSettingsDialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </Dialog>
  );
}

export default PreviewDialogBtn;
