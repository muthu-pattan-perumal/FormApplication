"use client";

import { useEffect, useState } from "react"; // already present
import { useDndMonitor, useDraggable, useDroppable } from "@dnd-kit/core";
import DesignerSidebar from "./DesignerSidebar";
import { cn } from "@/lib/utils";
import useDesigner from "./hooks/useDesigner";
import {
  ElementsType,
  FormElementInstance,
  FormElements,
} from "./FormElements";
import { idGenerator } from "@/lib/idGenerator";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";

// ✅ Helper to map size to Tailwind class
function getSizeClass(size: string,element:any) {
  switch (size) {
    case "small":
      return "col-span-3";
    case "medium":
      return "col-span-6";
    case "large":
      return "col-span-12";
    default:
      return "col-span-12";
  }
}

function Designer() {
  const {
    elements,
    addElement,
    selectedElement,
    setSelectedElement,
    removeElement,
  } = useDesigner();
const designer = useDesigner();
useEffect(() => {
  if (typeof window !== "undefined") {
    window.designerContext = {
      elements: designer.elements,
      updateElement: designer.updateElement,
    };

    window.setFieldOptions = (customId, options) => {
      if (!window.designerContext) return;
      const elements = window.designerContext.elements || [];
      const el = elements.find(
        (e) => (e as any).extraAttributes?.customId === customId
      );
      if (!el) return;

      window.designerContext.updateElement(el.id, {
        ...el,
        extraAttributes: {
          ...(el as any).extraAttributes,
          options,
        },
      });
    };
window.setFieldValue = (customId, value) => {
  // Find the DOM element by ID (assuming customId is assigned as DOM ID)
  const input = document.getElementById(customId) as HTMLInputElement;
  if (input) {
    input.value = value;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // Call watcher if defined
  const watcher = (window as any)[`__fieldWatchers__${customId}`];
  if (watcher) watcher(value);
};

    console.log("✅ designerContext and setFieldOptions ready");
  }
}, [designer.elements, designer.updateElement]);

  const droppable = useDroppable({
    id: "designer-drop-area",
    data: {
      isDesignerDropArea: true,
    },
  });

  useDndMonitor({
    onDragEnd({ active, over }) {
      if (!active || !over) return;

      const isDesignerBtnElement = active.data?.current?.isDesignerBtnElement;
      const isDroppingOverDesignerDropArea =
        over.data?.current?.isDesignerDropArea;

      const droppingSidebarBtnOverDesignerDropArea =
        isDesignerBtnElement && isDroppingOverDesignerDropArea;

      if (droppingSidebarBtnOverDesignerDropArea) {
        const type = active.data?.current?.type;
        const newElement = FormElements[type as ElementsType].construct(
          idGenerator()
        );
        addElement(elements.length, newElement);
        return;
      }

      const isDroppingOverDesignerElementTopHalf =
        over?.data?.current?.isDesignerElementTopHalf;
      const isDroppingOverDesignerElementBottomHalf =
        over?.data?.current?.isDesignerElementBottomHalf;

      const isDroppingOverDesignerElement =
        isDroppingOverDesignerElementTopHalf ||
        isDroppingOverDesignerElementBottomHalf;

      const droppingSidebarBtnOverDesignerElement =
        isDesignerBtnElement && isDroppingOverDesignerElement;

      if (droppingSidebarBtnOverDesignerElement) {
        const type = active.data?.current?.type;
        const newElement = FormElements[type as ElementsType].construct(
          idGenerator()
        );

        const overId = over.data?.current?.elementId;
        const overElementIndex = elements.findIndex((el) => el.id === overId);
        if (overElementIndex === -1) throw new Error("Element not found");

        let indexForNewElement = overElementIndex;
        if (isDroppingOverDesignerElementBottomHalf) {
          indexForNewElement = overElementIndex + 1;
        }

        addElement(indexForNewElement, newElement);
        return;
      }

      const isDraggingDesignerElement = active.data?.current?.isDesignerElement;
      const draggingDesignerElementOverAnotherDesignerElement =
        isDroppingOverDesignerElement && isDraggingDesignerElement;

      if (draggingDesignerElementOverAnotherDesignerElement) {
        const activeId = active.data?.current?.elementId;
        const overId = over.data?.current?.elementId;

        const activeElementIndex = elements.findIndex(
          (el) => el.id === activeId
        );
        const overElementIndex = elements.findIndex((el) => el.id === overId);

        if (activeElementIndex === -1 || overElementIndex === -1)
          throw new Error("Element not found");

        const activeElement = { ...elements[activeElementIndex] };
        removeElement(activeId);

        let newIndex = overElementIndex;
        if (isDroppingOverDesignerElementBottomHalf) {
          newIndex = overElementIndex + 1;
        }
        addElement(newIndex, activeElement);
      }
    },
  });

  return (
    <div className="flex h-full w-full">
      <div
        className="w-full p-4"
        onClick={() => {
          if (selectedElement) setSelectedElement(null);
        }}
      >
        <div
          ref={droppable.setNodeRef}
          className={cn(
            "grid  gap-2 p-4 overflow-y-auto rounded-xl bg-background",
            droppable.isOver && "ring-2 ring-primary/20"
          )}
          style={{minHeight:"70vh",maxHeight:'calc(100vh - 180px)'}}
        >
          {!droppable.isOver && elements.length === 0 && (
            <p className="flex flex-grow items-center text-3xl font-bold text-muted-foreground">
              Drop here
            </p>
          )}
          {droppable.isOver && elements.length === 0 && (
            <div className="w-full p-4">
              <div className="h-[120px] rounded-md bg-primary/20" />
            </div>
          )}
          {elements.length > 0 && (
            <div className="grid grid-cols-12 gap-2 p-4">
              {elements.map((element) => (
                <DesignerElementWrapper key={element.id} element={element} />
              ))}
            </div>
          )}
        </div>
      </div>
      <DesignerSidebar />
    </div>
  );
}

function DesignerElementWrapper({ element }: { element: FormElementInstance }) {
  const { removeElement, setSelectedElement } = useDesigner();
  const [mouseIsOver, setMouseIsOver] = useState<boolean>(false);

  const topHalf = useDroppable({
    id: element.id + "-top",
    data: {
      type: element.type,
      elementId: element.id,
      isDesignerElementTopHalf: true,
    },
  });

  const bottomHalf = useDroppable({
    id: element.id + "-bottom",
    data: {
      type: element.type,
      elementId: element.id,
      isDesignerElementBottomHalf: true,
    },
  });

  const draggable = useDraggable({
    id: element.id + "-drag-handler",
    data: {
      type: element.type,
      elementId: element.id,
      isDesignerElement: true,
    },
  });

  const DesignerElement = FormElements[element.type].designerComponent;

  if (draggable.isDragging) return null;

  // ✅ Extract size safely from extraAttributes
  const size =
    (element.extraAttributes as any)?.size || "large"; // fallback to medium

  return (
    <div
      ref={draggable.setNodeRef}
      {...draggable.listeners}
      {...draggable.attributes}
      className={cn(
        "relative rounded-md text-foreground ring-1 ring-inset ring-accent hover:cursor-pointer",
        getSizeClass(size,element) // ✅ Apply col-span
      )}
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedElement(element);
      }}
    >
      <div
        ref={topHalf.setNodeRef}
        className="absolute h-1/2 w-full rounded-t-md"
      />
      <div
        ref={bottomHalf.setNodeRef}
        className="absolute bottom-0 h-1/2 w-full rounded-b-md"
      />
      {mouseIsOver && (
        <>
          <div className="absolute right-0 z-10 h-full">
            <Button
              className="flex h-full justify-center rounded-md rounded-l-none border bg-red-500"
              onClick={(e) => {
                e.stopPropagation();
                removeElement(element.id);
              }}
            >
              <Trash2 className="h-6 w-6" />
            </Button>
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse">
            <p className="text-sm text-muted-foreground">
              Click for properties or drag to move
            </p>
          </div>
        </>
      )}
      {topHalf.isOver && (
        <div className="absolute top-0 h-[7px] w-full rounded-md rounded-b-none bg-primary" />
      )}
      <div
        className={cn(
          "pointer-events-none flex h-[120px] w-full items-center rounded-md bg-accent/40 px-4 py-2",
          mouseIsOver && "opacity-30"
        )}
      >
        <DesignerElement elementInstance={element} />
      </div>
      {bottomHalf.isOver && (
        <div className="absolute bottom-0 h-[7px] w-full rounded-md rounded-t-none bg-primary" />
      )}
    </div>
  );
}

export default Designer;
