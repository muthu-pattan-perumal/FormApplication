// form-elements/NumberField.tsx
import { Binary, Plus } from "lucide-react";
import * as z from "zod";
import {
  ElementsType,
  FormElement,
  FormElementInstance,
  SubmitFunction,
} from "../FormElements";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import useDesigner from "../hooks/useDesigner";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const type: ElementsType = "NumberField";

const propertiesSchema = z.object({
  label: z.string().max(200),
  helperText: z.string().max(50),
  required: z.boolean().default(false),
  placeHolder: z.string().max(50),
  calculationSteps: z
    .array(
      z.object({
        fieldId: z.string(),
        operator: z.string().optional(),
      })
    )
    .optional(),
});

export const NumberFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes: {
      label: "Number field",
      helperText: "Helper text",
      required: false,
      placeHolder: "0",
      calculationSteps: [],
    },
  }),
  designerBtnElement: {
    icon: Binary,
    label: "Number field",
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (formElement: FormElementInstance, currentValue: string) => {
    const element = formElement as CustomInstance;
    if (element.extraAttributes.required) {
      return currentValue.length > 0;
    }
    return true;
  },
};

type CustomInstance = FormElementInstance & {
  extraAttributes: z.infer<typeof propertiesSchema>;
};

type PropertiesFormSchemaType = z.infer<typeof propertiesSchema>;

function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { label, required, placeHolder, helperText, calculationSteps } =
    element.extraAttributes;

  return (
    <div className="flex w-full flex-col gap-2">
      <Label>
        {label}
        {required && "*"}
      </Label>
      <Input readOnly disabled placeholder={placeHolder} />
      {helperText && (
        <p className="text-[0.8rem] text-muted-foreground">{helperText}</p>
      )}
      {calculationSteps?.length ? (
        <p className="text-xs text-gray-400">
          Calculation: {calculationSteps.map((s, i) => `${i > 0 ? s.operator : ''}${s.fieldId}`).join(' ')}
        </p>
      ) : null}
    </div>
  );
}

function evaluateCalculation(
  steps: { fieldId: string; operator?: string }[]
): string {
  if (typeof window === "undefined" || !steps?.length) return "";

  try {
    const values = steps.map((step) => {
      const input = document.getElementById(step.fieldId) as HTMLInputElement | null;
      return input ? parseFloat(input.value || "0") : 0;
    });

    const expression = steps.reduce((acc, step, idx) => {
      let operator = idx === 0 ? "" : step.operator || "+";
      let value = values[idx];

      if (operator === "%") {
        operator = "*";
        value = value / 100;
      }

      return acc + operator + value;
    }, "");

    const result = eval(expression);
    return isNaN(result) ? "" : result.toString();
  } catch (err) {
    console.error("Calculation error:", err);
    return "";
  }
}



function FormComponent({
  elementInstance,
  submitValue,
  isInvalid,
  defaultValue,
}: {
  elementInstance: FormElementInstance;
  submitValue?: SubmitFunction;
  isInvalid?: boolean;
  defaultValue?: string;
}) {
  const element = elementInstance as CustomInstance;
  const [value, setValue] = useState(defaultValue || "");
  const [error, setError] = useState(false);

  const { label, required, placeHolder, helperText, calculationSteps } =
    element.extraAttributes;

  const isCalculated = Array.isArray(calculationSteps) && calculationSteps.length > 0;

useEffect(() => {
  if (!isCalculated || typeof window === "undefined") return;

  const handler = () => {
    const newValue = evaluateCalculation(calculationSteps);
    setValue(newValue);
    if (submitValue) submitValue(element.id, newValue);
  };

  document.addEventListener("input", handler);

  // Initial trigger (so value calculates on first load)
  handler();

  return () => {
    document.removeEventListener("input", handler);
  };
}, [isCalculated, calculationSteps]);


  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  return (
    <div className="flex w-full flex-col gap-2">
      <Label className={cn(error && "text-red-500")}>{label}{required && "*"}</Label>
      <Input
        type="number"
        id={element.id}
        className={cn(error && "border-red-500")}
        placeholder={placeHolder}
        value={value}
        onChange={(e) => {
          const newValue = e.target.value;
          if (!isCalculated) {
            setValue(newValue);
            if (submitValue) submitValue(element.id, newValue);
          }
        }}
        onBlur={(e) => {
          if (!submitValue || isCalculated) return;
          const valid = NumberFieldFormElement.validate(element, e.target.value);
          setError(!valid);
          if (!valid) return;
          submitValue(element.id, e.target.value);
        }}
        readOnly={isCalculated}
      />
      {helperText && (
        <p className={cn("text-[0.8rem] text-muted-foreground", error && "text-red-500")}>{helperText}</p>
      )}
    </div>
  );
}

function PropertiesComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const { updateElement, elements } = useDesigner();
  const element = elementInstance as CustomInstance;
  const form = useForm<PropertiesFormSchemaType>({
    resolver: zodResolver(propertiesSchema),
    mode: "onBlur",
    defaultValues: element.extraAttributes,
  });

  useEffect(() => {
    form.reset(element.extraAttributes);
  }, [element, form]);

  const numberFields = elements.filter(
    (el) => el.type === "NumberField" && el.id !== element.id
  );

  const calculationSteps = form.watch("calculationSteps") || [];

  const addStep = () => {
    const newSteps = [
      ...calculationSteps,
      {
        fieldId: "",
        operator: calculationSteps.length > 0 ? "+" : undefined,
      },
    ];
    form.setValue("calculationSteps", newSteps);
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        calculationSteps: newSteps,
      },
    });
  };

  const updateStep = (
    index: number,
    key: "fieldId" | "operator",
    value: string
  ) => {
    const updated = [...calculationSteps];
    updated[index][key] = value;
    form.setValue("calculationSteps", updated);
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        calculationSteps: updated,
      },
    });
  };

  const removeStep = (index: number) => {
    const updated = [...calculationSteps];
    updated.splice(index, 1);
    form.setValue("calculationSteps", updated);
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        calculationSteps: updated,
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => e.preventDefault()}
        onBlur={form.handleSubmit((values) => {
          updateElement(element.id, {
            ...element,
            extraAttributes: {
              ...element.extraAttributes,
              ...values,
            },
          });
        })}
      >
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="placeHolder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placeholder</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="helperText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Helper text</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="required"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Required</FormLabel>
                <FormDescription>If the field is mandatory</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="calculationSteps"
          render={() => (
            <FormItem>
              <FormLabel>Calculation</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <div className="space-y-2 mt-4">
                    {calculationSteps.map((step, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        {index > 0 && (
                          <select
                            value={step.operator || "+"}
                            onChange={(e) => updateStep(index, "operator", e.target.value)}
                            className="rounded border px-2 py-1"
                          >
                            <option value="+">+</option>
                            <option value="-">-</option>
                            <option value="*">*</option>
                            <option value="/">/</option>
                            <option value="%">%</option>
                          </select>
                        )}
                        <select
                          value={step.fieldId}
                          onChange={(e) => updateStep(index, "fieldId", e.target.value)}
                          className="rounded border px-2 py-1"
                        >
                          <option value="">Select field</option>
                          {numberFields.map((field) => (
                            <option key={field.id} value={field.id}>
                              {(field.extraAttributes as any).label || field.id}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="text-sm text-red-500 hover:underline"
                          onClick={() => removeStep(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addStep}
                    className="flex gap-2 items-center"
                  >
                    <Plus className="w-4 h-4" /> Add Field/Operator
                  </Button>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
