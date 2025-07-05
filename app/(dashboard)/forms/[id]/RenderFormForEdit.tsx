"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormElementInstance, FormElements } from "@/components/FormElements";
import { updateFormSubmission } from "@/app/api/actions/form";
import { toast } from "@/components/ui/use-toast";

interface RenderFormForEditProps {
  formId: any;
  submissionId: any;
  data: Record<string, string>;
  formElements: FormElementInstance[];
  onClose: () => void;
}

export default function RenderFormForEdit({
  formId,
  submissionId,
  data,
  formElements,
  onClose,
}: RenderFormForEditProps) {
  const [formData, setFormData] = useState<Record<string, string>>({ ...data });

  const handleValueChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    try {
      await updateFormSubmission(formId, submissionId, formData);
      toast({
        title: "Updated",
        description: "Submission saved successfully.",
      });
      onClose();
    } catch {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {formElements.map(el => {
        const Comp = FormElements[el.type]?.formComponent;
        if (!Comp) return null;

        const defaultValue = formData[el.id];

        return (
          <Comp
            key={el.id}
            elementInstance={el}
            defaultValue={defaultValue}
            submitValue={(id, val) => handleValueChange(id, val)}
          />
        );
      })}
      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}
