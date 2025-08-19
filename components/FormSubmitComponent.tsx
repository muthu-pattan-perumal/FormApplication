"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Loader2, MousePointerClick } from "lucide-react";
import { FormElementInstance, FormElements } from "./FormElements";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import { SubmitForm } from "@/actions/form";

interface Props {
  formContent: FormElementInstance[];
  formURL: string;
  globalSettings: {
    backgroundColor: string;
    borderRadius: string;
    showSubmit: Boolean;
  };
}

declare global {
  interface Window {
    dispatchEvent: (event: Event) => boolean;
  }
}

function FormSubmitComponent({ formContent, formURL, globalSettings }: Props) {
  const formValues = useRef<{ [key: string]: string }>({});
  const formErrors = useRef<{ [key: string]: boolean }>({});
  const [renderKey, setRenderKey] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  // ✅ Collect all values and validate before submit
  const validateForm = useCallback(() => {
    formErrors.current = {}; // reset error state
    for (const field of formContent) {
      const val = formValues.current[field.id] ?? "";
      const isValid = FormElements[field.type]?.validate?.(field, val);
      if (!isValid) {
        console.log("Error in field", field, val);
        formErrors.current[field.id] = true;
      }
    }
    return Object.keys(formErrors.current).length === 0;
  }, [formContent]);

  // ✅ Called by each field to submit its value
  const submitValue = useCallback((key: string, value: string) => {
    formValues.current[key] = value;
  }, []);

  // ✅ Main form submission
  const submitForm = async () => {
    const isValid = validateForm();

    if (!isValid) {
      setRenderKey(Date.now()); // trigger re-render to show errors
      toast({
        title: "Error",
        description: "Please check the form for errors",
        variant: "destructive",
      });
      return;
    }

    try {
      const JSONContent = JSON.stringify(formValues.current);
      console.log("🔁 Submitting form values:", formValues.current);

      await SubmitForm(formURL, JSONContent);
      setSubmitted(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
      });
    }
  };

  // ✅ Allow external trigger from window.dispatchEvent(new Event("submit-form"))
  useEffect(() => {
    const handler = () => {
      console.log("🚀 submit-form event received");
      startTransition(submitForm);
    };

    window.addEventListener("submit-form", handler);
    return () => window.removeEventListener("submit-form", handler);
  }, [submitForm]);

  if (submitted) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="flex w-full max-w-[620px] flex-grow flex-col gap-4 overflow-y-auto rounded border bg-background p-8 shadow-xl shadow-blue-700">
          <h1 className="text-2xl font-bold">Form submitted</h1>
          <p className="text-muted-foreground">
            Thank you for submitting this form, you can close this page now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div
        key={renderKey}
        className="overflow-y-auto rounded border p-8 shadow-xl shadow-blue-700"
        style={{
          width: "100%",
          backgroundColor: globalSettings.backgroundColor,
          borderRadius: globalSettings.borderRadius,
        }}
      >
        <div className="grid grid-cols-12 gap-4">
          {formContent.map((element) => {
            const FormElement = FormElements[element.type]?.formComponent;
            if (!FormElement) return null;

            return (
              <FormElement
                key={element.id}
                elementInstance={element}
                submitValue={submitValue}
                isInvalid={formErrors.current[element.id]}
                defaultValue={formValues.current[element.id]}
              />
            );
          })}
        </div>

        {globalSettings.showSubmit && <Button
          onClick={() => startTransition(submitForm)}
          disabled={pending}
          style={{ margin: "3rem", width: "90%" }}
        >
          {pending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <MousePointerClick className="mr-2" /> Submit
            </>
          )}
        </Button>}
      </div>
    </div>
  );
}

export default FormSubmitComponent;
