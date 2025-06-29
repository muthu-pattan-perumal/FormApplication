// CardFormElement.tsx
"use client";

import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import useDesigner from "../hooks/useDesigner";
import { FormElement, FormElementInstance, ElementsType } from "../FormElements";
import { v4 as uuidv4 } from "uuid";
import ImageEditorModal from "../ImageEditorModal";
import { SquareIcon, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const type: ElementsType = "CardField";

const blockTypes = ["heading", "subheading", "paragraph", "button", "image"] as const;
type BlockType = typeof blockTypes[number];

interface CardBlock {
  id: string;
  type: BlockType;
  content: string;
  settings: {
    fontSize?: string;
    width?: string;
    fontWeight?: string;
    fontFamily?: string;
    textColor?: string;
    backgroundColor?: string;
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
    align?: "left" | "center" | "right";
    imageWidth?: string;
    imageHeight?: string;
    borderRadius?: string;
    label?: string;
    script?: string;
    gridWidth?: string; // New field for layout (e.g., '6' for col-span-6)
  };
}

const extraAttributes = {
  blocks: [] as CardBlock[],
  size: "medium" as "small" | "medium" | "large",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  marginTop: "10px",
  marginBottom: "10px",
  borderColor: "#e5e7eb",
  borderWidth: "1px",
  borderStyle: "solid",
  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
};

function cloneExtraAttributes(attrs: typeof extraAttributes): typeof extraAttributes {
  return {
    ...attrs,
    blocks: attrs.blocks.map(block => ({
      ...block,
      settings: { ...block.settings },
    })),
  };
}

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

export const CardFormElement: FormElement = {
  type,
  construct: (id) => ({ id, type, extraAttributes: cloneExtraAttributes(extraAttributes) }),
  designerBtnElement: { icon: SquareIcon, label: "Card" },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: () => true,
};

function getSizeClass(size: "small" | "medium" | "large") {
  return {
    small: "col-span-3",
    medium: "col-span-6",
    large: "col-span-12",
  }[size];
}

function handleCardButtonClick(block: CardBlock) {
  try {
    const fn = new Function(block.settings.script || "");
    fn();
  } catch (err) {
    alert("Script error: " + (err as Error).message);
  }
}

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const el = elementInstance as CustomInstance;
  const {
    blocks,
    size,
    backgroundColor,
    borderRadius,
    marginTop,
    marginBottom,
    borderColor,
    borderWidth,
    borderStyle,
    boxShadow,
  } = el.extraAttributes;

  return (
    <div
      className={cn("p-4 grid grid-cols-12 gap-4", getSizeClass(size))}
      style={{
        backgroundColor,
        borderRadius,
        marginTop,
        marginBottom,
        width: "100%",
        border: `${borderWidth} ${borderStyle} ${borderColor}`,
        boxShadow,
      }}
    >
      {blocks.map((b) => renderBlock(b, backgroundColor))}
    </div>
  );
}

function renderBlock(block: CardBlock, fallbackBackground: string) {
  const resolvedBg = block.settings.backgroundColor?.trim();
  const baseStyle: React.CSSProperties = {
    fontSize: block.settings.fontSize,
    fontWeight: block.settings.fontWeight,
    fontFamily: block.settings.fontFamily,
    color: block.settings.textColor,
    backgroundColor: resolvedBg ? resolvedBg : fallbackBackground,
    marginTop: block.settings.marginTop,
    marginBottom: block.settings.marginBottom,
    marginLeft: block.settings.align === "center" ? "auto" : block.settings.marginLeft,
    marginRight: block.settings.align === "center" ? "auto" : block.settings.marginRight,
    textAlign: block.settings.align,
    width: block.settings.width || "100%",
    borderRadius: block.settings.borderRadius,
  };

  const span = `col-span-${block.settings.gridWidth || "12"}`;

  switch (block.type) {
    case "heading":
      return <div key={block.id} className={span}><h2 style={baseStyle}>{block.content}</h2></div>;
    case "subheading":
      return <div key={block.id} className={span}><h3 style={baseStyle}>{block.content}</h3></div>;
    case "paragraph":
      return <div key={block.id} className={span}><p style={baseStyle}>{block.content}</p></div>;
    case "button":
      return (
        <div key={block.id} className={span} style={{ textAlign: block.settings.align }}>
          <Button
            onClick={() => handleCardButtonClick(block)}
            style={{
              ...baseStyle,
              backgroundColor: resolvedBg ? resolvedBg : fallbackBackground,
              borderRadius: block.settings.borderRadius,
              width: block.settings.width || "100%",
            }}
          >
            {block.settings.label || block.content}
          </Button>
        </div>
      );
    case "image":
      return (
        <div key={block.id} className={span}>
          <img
            src={block.content}
            style={{
              display: block.settings.align === "center" ? "block" : "inline-block",
              marginLeft: block.settings.align === "center" ? "auto" : block.settings.marginLeft,
              marginRight: block.settings.align === "center" ? "auto" : block.settings.marginRight,
              width: block.settings.imageWidth || "100%",
              height: block.settings.imageHeight || "auto",
              borderRadius: block.settings.borderRadius,
              marginTop: block.settings.marginTop,
              marginBottom: block.settings.marginBottom,
              backgroundColor: resolvedBg ? resolvedBg : fallbackBackground,
            }}
            alt="card-img"
          />
        </div>
      );
    default:
      return null;
  }
}

function FormComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  return <DesignerComponent elementInstance={elementInstance} />;
}

function SortableBlock({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div {...listeners} className="cursor-grab w-full text-right text-gray-500">
        <GripVertical className="inline-block" />
      </div>
      {children}
    </div>
  );
}

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {

  const { updateElement } = useDesigner();
  const el = elementInstance as CustomInstance;

  const [attrs, setAttrs] = useState(() => ({ ...el.extraAttributes }));

  // ✅ When elementInstance changes, update local state
  useEffect(() => {
    setAttrs({ ...el.extraAttributes });
  }, [el.id]);

  // ✅ When local attrs change, update the designer state
  useEffect(() => {
    updateElement(el.id, { ...el, extraAttributes: attrs });
  }, [attrs]);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [editSrc, setEditSrc] = useState<string>("");

  const sensors = useSensors(useSensor(PointerSensor));

  const add = (type: BlockType) => {
    const newBlock: CardBlock = {
      id: uuidv4(),
      type,
      content: type === "image" ? "" : `${type} content`,
      settings: {
        fontSize: "16px",
        fontWeight: "400",
        fontFamily: "Arial",
        textColor: "#000000",
        backgroundColor: "",
        marginTop: "0px",
        marginBottom: "0px",
        marginLeft: "0px",
        marginRight: "0px",
        align: "left",
        imageWidth: "100%",
        imageHeight: "auto",
        borderRadius: "0px",
        label: "",
        script: "",
      },
    };
    setAttrs((prev) => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
  };

  const remove = (id: string) =>
    setAttrs((prev) => ({ ...prev, blocks: prev.blocks.filter((b) => b.id !== id) }));

  const updateBlock = <K extends keyof CardBlock>(id: string, key: K, value: any) =>
    setAttrs((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === id ? { ...b, [key]: value } : b)),
    }));

  const updateSettings = <K extends keyof CardBlock["settings"]>(id: string, key: K, value: any) =>
    setAttrs((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === id ? { ...b, settings: { ...b.settings, [key]: value } } : b
      ),
    }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = attrs.blocks.findIndex((b) => b.id === active.id);
      const newIndex = attrs.blocks.findIndex((b) => b.id === over?.id);
      setAttrs((prev) => ({
        ...prev,
        blocks: arrayMove(prev.blocks, oldIndex, newIndex),
      }));
    }
  };
  const startImageEdit = (block: CardBlock) => {
    console.log(block)
    setEditingImage(block.id);
    setEditSrc(block.content);
  };
  const saveImageEdit = (base64: string) => {
    if (editingImage) {
      updateBlock(editingImage, "content", base64);
      setEditingImage(null);
    }
  };

  useEffect(() => {
    updateElement(el.id, { ...el, extraAttributes: attrs });
  }, [attrs]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Card Size:</Label>
          <select
            value={attrs.size}
            onChange={(e) => setAttrs((prev) => ({ ...prev, size: e.target.value as any }))}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div>
          <Label>Background Color:</Label>
          <Input
            type="color"
            value={attrs.backgroundColor}
            onChange={(e) => setAttrs((prev) => ({ ...prev, backgroundColor: e.target.value }))}
          />
        </div>

        <div>
          <Label>Border Color:</Label>
          <Input
            type="color"
            value={attrs.borderColor}
            onChange={(e) => setAttrs((prev) => ({ ...prev, borderColor: e.target.value }))}
          />
        </div>

        <div>
          <Label>Border Width:</Label>
          <Input
            type="text"
            value={attrs.borderWidth}
            onChange={(e) => setAttrs((prev) => ({ ...prev, borderWidth: e.target.value }))}
          />
        </div>

        <div>
          <Label>Border Style:</Label>
          <select
            value={attrs.borderStyle}
            onChange={(e) => setAttrs((prev) => ({ ...prev, borderStyle: e.target.value }))}
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="double">Double</option>
            <option value="none">None</option>
          </select>
        </div>

        <div>
          <Label>Box Shadow:</Label>
          <Input
            type="text"
            placeholder="e.g. 0 2px 6px rgba(0,0,0,0.1)"
            value={attrs.boxShadow}
            onChange={(e) => setAttrs((prev) => ({ ...prev, boxShadow: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {blockTypes.map((type) => (
          <Button key={type} onClick={() => add(type)} size="sm">
            Add {type}
          </Button>
        ))}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={attrs.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {attrs.blocks.map((block) => (
            <SortableBlock key={block.id} id={block.id}>
              <div className="border p-2 rounded space-y-2 bg-white">
                <div className="flex justify-between">
                  <Label>{block.type}  ({block?.id})</Label>
                  <Button variant="destructive" size="sm" onClick={() => remove(block.id)}>
                    Delete
                  </Button>
                </div>

                {block.type === "image" ? (
                  <>
                    <Input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            const result = reader.result as string;
                            setEditSrc(result);
                            setEditingImage(block.id);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <Button size="sm" onClick={() => startImageEdit(block)}>
                      Edit Image
                    </Button>
                  </>
                ) : (
                  <Input
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, "content", e.target.value)}
                    placeholder={`Enter ${block.type} content`}
                  />
                )}
                {block.type === "button" && (
                  <>
                    <Input
                      value={block.settings.label || ""}
                      onChange={(e) => updateSettings(block.id, "label", e.target.value)}
                      placeholder="Button Label"
                    />
                    <textarea
                      className="w-full border rounded p-1 text-sm"
                      rows={4}
                      value={block.settings.script || ""}
                      onChange={(e) => updateSettings(block.id, "script", e.target.value)}
                      placeholder="Enter JavaScript (e.g., window.open('https://example.com'))"
                    />

                    <select
                      value={block.settings.align || "left"}
                      onChange={(e) => updateSettings(block.id, "align", e.target.value)}
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </>
                )
                }
                <Label>Size (Grid Width 1-12):</Label>
                <Input
                  placeholder="Grid Width (1-12)"
                  value={block.settings.gridWidth || ""}
                  onChange={(e) => updateSettings(block.id, "gridWidth", e.target.value)}
                />
                <Label>Modal Settings:</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="color"
                    value={block.settings.textColor!}
                    onChange={(e) => updateSettings(block.id, "textColor", e.target.value)}
                  />
                  <Input
                    placeholder="Font Size"
                    value={block.settings.fontSize!}
                    onChange={(e) => updateSettings(block.id, "fontSize", e.target.value)}
                  />
                  <Input
                    placeholder="Font Weight"
                    value={block.settings.fontWeight!}
                    onChange={(e) => updateSettings(block.id, "fontWeight", e.target.value)}
                  />
                  <Input
                    placeholder="Font Family"
                    value={block.settings.fontFamily!}
                    onChange={(e) => updateSettings(block.id, "fontFamily", e.target.value)}
                  />
                  <select
                    value={block.settings.align}
                    onChange={(e) => updateSettings(block.id, "align", e.target.value as any)}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                  <Input
                    placeholder="Margin Top"
                    value={block.settings.marginTop!}
                    onChange={(e) => updateSettings(block.id, "marginTop", e.target.value)}
                  />
                  <Input
                    placeholder="Margin Bottom"
                    value={block.settings.marginBottom!}
                    onChange={(e) => updateSettings(block.id, "marginBottom", e.target.value)}
                  />
                  <Input
                    placeholder="Margin Left"
                    value={block.settings.marginLeft!}
                    onChange={(e) => updateSettings(block.id, "marginLeft", e.target.value)}
                  />
                  <Input
                    placeholder="Margin Right"
                    value={block.settings.marginRight!}
                    onChange={(e) => updateSettings(block.id, "marginRight", e.target.value)}
                  />

                  {block.type === "image" && (
                    <>
                      <Input
                        placeholder="Image Width"
                        value={block.settings.imageWidth!}
                        onChange={(e) => updateSettings(block.id, "imageWidth", e.target.value)}
                      />
                      <Input
                        placeholder="Image Height"
                        value={block.settings.imageHeight!}
                        onChange={(e) => updateSettings(block.id, "imageHeight", e.target.value)}
                      />
                    </>
                  )}

                  <Input
                    type="color"
                    value={block.settings.backgroundColor || "#ffffff"}
                    onChange={(e) => updateSettings(block.id, "backgroundColor", e.target.value)}
                    placeholder="Background Color"
                  />
                  <Input
                    placeholder="Border Radius"
                    value={block.settings.borderRadius || ""}
                    onChange={(e) => updateSettings(block.id, "borderRadius", e.target.value)}
                  />
                  <Input
                    placeholder=" Width (e.g., 200px or 100%)"
                    value={block.settings.width || ""}
                    onChange={(e) => updateSettings(block.id, "width", e.target.value)}
                  />
                  <Input
                    placeholder="Border Radius"
                    value={block.settings.borderRadius!}
                    onChange={(e) => updateSettings(block.id, "borderRadius", e.target.value)}
                  />
                </div>

              </div>
            </SortableBlock>
          ))}
        </SortableContext>
      </DndContext>

      {editingImage && (
        <ImageEditorModal
          open={true}
          onClose={() => setEditingImage(null)}
          image={editSrc}
          onSave={saveImageEdit}
        />
      )}
    </div>
  );
}
