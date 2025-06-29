"use client";

import { useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function ImageEditorModal({
    open,
    onClose,
    image,
    onSave,
}: {
    open: boolean;
    onClose: () => void;
    image: string;
    onSave: (base64: string) => void;
}) {
    const editorRef = useRef<AvatarEditor>(null);
    const [zoom, setZoom] = useState(1);
    const [borderRadius, setBorderRadius] = useState(125);
    const [bgColor, setBgColor] = useState("#ff0000");

    const handleSave = () => {
        if (editorRef.current) {
            const canvas = editorRef.current.getImageScaledToCanvas();
            const size = canvas.width;
            const outputCanvas = document.createElement("canvas");
            outputCanvas.width = size;
            outputCanvas.height = canvas.height;
            const ctx = outputCanvas.getContext("2d");

            if (ctx) {
                // Fill background
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

                // Apply rounded rect clipping instead of full circle
                const radius = borderRadius;
                const w = outputCanvas.width;
                const h = outputCanvas.height;

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(radius, 0);
                ctx.lineTo(w - radius, 0);
                ctx.quadraticCurveTo(w, 0, w, radius);
                ctx.lineTo(w, h - radius);
                ctx.quadraticCurveTo(w, h, w - radius, h);
                ctx.lineTo(radius, h);
                ctx.quadraticCurveTo(0, h, 0, h - radius);
                ctx.lineTo(0, radius);
                ctx.quadraticCurveTo(0, 0, radius, 0);
                ctx.closePath();
                ctx.clip();

                // Draw the image inside the clipping path
                ctx.drawImage(canvas, 0, 0, w, h);
                ctx.restore();

                // Output
                const finalImage = outputCanvas.toDataURL("image/png");
                onSave(finalImage);
                onClose();
            }
        }
    };


    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-[450px]">
                <DialogHeader>Edit Image</DialogHeader>

                <AvatarEditor
                    ref={editorRef}
                    image={image}
                    width={250}
                    height={250}
                    border={30}
                    borderRadius={borderRadius}
                    color={bgColor
                        .replace("#", "")
                        .match(/.{1,2}/g)
                        ?.map((c) => parseInt(c, 16)) || [255, 255, 255, 255]}
                    scale={zoom}
                />

                <div className="space-y-3 mt-4">
                    <div>
                        <label>Zoom</label>
                        <Input
                            type="range"
                            min="1"
                            max="5"
                            step="0.1"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                        />
                    </div>
                    <div>
                        <label>Border Radius</label>
                        <Input
                            type="range"
                            min="0"
                            max="125"
                            value={borderRadius}
                            onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                        />
                    </div>
                    <div>
                        <label>Background Color</label>
                        <Input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
