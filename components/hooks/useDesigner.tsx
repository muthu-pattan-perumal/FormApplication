"use client";

import { useContext } from "react";
import { DesignerContext } from "../context/DesignerContext";

function useDesigner() {
  const context = useContext(DesignerContext);
  if (!context) {
    throw new Error(
      "useDesigner must be used within a DesignerContextProvider"
    );
  }

  const { elements, ...rest } = context;

  // Handle old and new format of elements
  const normalizedElements = Array.isArray(elements)
    ? elements
    : elements?.elements || [];

  const normalizedGlobalSettings = Array.isArray(elements)
    ? rest.globalSettings
    : elements?.globalSettings || rest.globalSettings;

  return {
    ...rest,
    elements: normalizedElements,
    globalSettings: normalizedGlobalSettings,
  };
}

export default useDesigner;
