"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormElementInstance, FormElements } from "@/components/FormElements";
import { updateFormSubmission } from "@/lib/actions/form";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
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
 const [isLoading, setIsLOading] = useState(false);
  const handleValueChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    setIsLOading(true)
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
    setIsLOading(false)
  };

  return (
    <div className="space-y-6">
      <div style={{ maxHeight: '70vh',overflowY: 'scroll' }}>
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
        })}</div>
      <div className="flex justify-end">
       <Button onClick={handleSave} disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? "Saving..." : "Save Changes"}
</Button>
      </div>
    </div>
  );
}
