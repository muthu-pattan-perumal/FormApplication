"use client";

import {
  createContext,
  ReactNode,
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
import { FormElementInstance } from "../FormElements";

// Define global settings type
export type GlobalSettings = {
  backgroundColor: string;
  borderRadius: string;
};

export type ElementsContainer = {
  elements: FormElementInstance[];
  globalSettings: GlobalSettings;
};

type DesignerContextType = {
  elements: ElementsContainer;
  setElements: Dispatch<SetStateAction<ElementsContainer>>;
  selectedElement: FormElementInstance | null;
  setSelectedElement: Dispatch<SetStateAction<FormElementInstance | null>>;
  addElement: (idx: number, element: FormElementInstance) => void;
  removeElement: (id: string) => void;
  updateElement: (id: string, element: FormElementInstance) => void;
  globalSettings: GlobalSettings;
  setGlobalSettings: (settings: Partial<GlobalSettings>) => void;
};

export const DesignerContext = createContext<DesignerContextType | null>(null);

type DesignerProviderProps = {
  children: ReactNode;
  initialData?: any; // support both old and new format
};

export default function DesignerContextProvider({
  children,
  initialData,
}: DesignerProviderProps) {
  const [elements, setElements] = useState<ElementsContainer>({
    elements: [],
    globalSettings: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
    },
  });

  const [selectedElement, setSelectedElement] =
    useState<FormElementInstance | null>(null);

  useEffect(() => {
    if (initialData) {
      const maybeNested = initialData.elements;

      const normalizedElements = Array.isArray(maybeNested)
        ? maybeNested
        : maybeNested?.elements || [];

      const normalizedSettings =
        maybeNested?.globalSettings ||
        initialData.globalSettings || {
          backgroundColor: "#ffffff",
          borderRadius: "12px",
        };

      setElements({
        elements: normalizedElements,
        globalSettings: normalizedSettings,
      });
    }
  }, [initialData]);

  const addElement = (idx: number, element: FormElementInstance) => {
    setElements((prev) => {
      const newElements = [...(prev?.elements || [])];
      newElements.splice(idx, 0, element);
      return { ...prev, elements: newElements };
    });
  };

  const removeElement = (id: string) => {
    setElements((prev) => ({
      ...prev,
      elements: prev?.elements.filter((el) => el.id !== id),
    }));
  };

  const updateElement = (id: string, updated: FormElementInstance) => {
    setElements((prev) => {
      const index = prev?.elements.findIndex((el) => el.id === id);
      if (index === -1) return prev;
      const newElements = [...(prev?.elements || [])];
      newElements[index] = updated;
      return { ...prev, elements: newElements };
    });
  };

  const setGlobalSettings = (settings: Partial<GlobalSettings>) => {
    setElements((prev) => ({
      ...prev,
      globalSettings: {
        ...prev.globalSettings,
        ...settings,
      },
    }));
  };

  return (
    <DesignerContext.Provider
      value={{
        elements,
        setElements,
        selectedElement,
        setSelectedElement,
        addElement,
        removeElement,
        updateElement,
        globalSettings: elements.globalSettings,
        setGlobalSettings,
      }}
    >
      {children}
    </DesignerContext.Provider>
  );
}
