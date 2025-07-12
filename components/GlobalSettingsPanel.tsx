"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import useDesigner from "./hooks/useDesigner";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function GlobalSettingsDialog({ open, onClose }: Props) {
  const { globalSettings, setGlobalSettings } = useDesigner();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="backdrop-blur-5 " style={{background:"transparent"}}>
        <DialogHeader>
          <DialogTitle>Global Page Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label>Background Color</Label>
            <Input
              type="color"
              value={globalSettings?.backgroundColor}
              onChange={(e) => setGlobalSettings({ backgroundColor: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Border Radius</Label>
            <Input
              type="text"
              value={globalSettings?.borderRadius}
              onChange={(e) => setGlobalSettings({ borderRadius: e.target.value })}
              placeholder="e.g., 12px"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
