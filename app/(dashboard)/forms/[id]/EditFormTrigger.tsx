"use client";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import RenderFormForEdit from "./RenderFormForEdit";
import { FormElementInstance } from "@/components/FormElements";

interface EditFormTriggerProps {
  formId: any;
  submissionId: any;
  data: Record<string, any>;
  formElements: FormElementInstance[];
}

export default function EditFormTrigger({
  formId,
  submissionId,
  data,
  formElements,
}: EditFormTriggerProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button>
          <Pencil size={16} />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <RenderFormForEdit
          formId={formId}
          submissionId={submissionId}
          data={data}
          formElements={formElements}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
