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
  customId: z.string().max(100).optional(),
  label: z.string().max(200),
  helperText: z.string().max(50),
  required: z.boolean().default(false),
  placeHolder: z.string().max(50),
  size: z.enum(["small", "medium", "large"]).default("medium"),
  inputWidth: z.string().default("100%"), // NEW
  alignment: z.enum(["left", "center", "right"]).default("left"), // NEW
  color: z.string().optional(),
  background: z.string().optional(),
  borderRadius: z.string().optional(),
  borderColor: z.string().optional(),
  borderWidth: z.string().optional(),
  calculationSteps: z
    .array(
      z.object({
        fieldId: z.string(),
        operator: z.string().optional(),
      })
    )
    .optional(),
});

const getSizeClass = (size: "small" | "medium" | "large" = "medium") => {
  switch (size) {
    case "small":
      return "col-span-3";
    case "medium":
      return "col-span-6";
    case "large":
      return "col-span-12";
    default:
      return "col-span-6";
  }
};
function getAlignment(alignment: "left" | "center" | "right") {
  return {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  }[alignment];
}

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
      size: "medium",
      calculationSteps: [],
      customId: '',
      inputWidth: "100%", // NEW
      alignment: "left" as "left" | "center" | "right", // NEW
      color: "#000000",
      background: "white",
      borderRadius: "5px",
      borderColor: "gray",
      borderWidth: "1px",
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

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { label, required, placeHolder, helperText, calculationSteps, size } = element.extraAttributes;
  const {
    color,
    background,
    borderRadius,
    borderColor,
    borderWidth,
  } = element.extraAttributes;

  const style = {
    color,
    background,
    borderRadius,
    borderColor,
    borderWidth,
  } as React.CSSProperties;
  return (
    <div className={cn("flex w-full flex-col gap-2", getSizeClass(size))}>
      <div
        className="flex flex-col gap-2"
        style={{
          alignItems: getAlignment(element.extraAttributes.alignment),
        }}
      >
        <div style={{ width: element.extraAttributes.inputWidth }}>

          <Label style={{ color: element.extraAttributes.color }}>
            {label}
            {required && "*"}
          </Label>
          <Input id={element.id} readOnly disabled placeholder={placeHolder} style={{ ...style }} />
          {helperText && <p className="text-[0.8rem] text-muted-foreground">{helperText}</p>}
          {calculationSteps?.length ? (
            <p className="text-xs text-gray-400">
              Calculation:{" "}
              {calculationSteps.map((s, i) => `${i > 0 ? s.operator : ""}${s.fieldId}`).join(" ")}
            </p>
          ) : null}</div></div>
    </div>
  );
}

function evaluateCalculation(steps: { fieldId: string; operator?: string }[]): string {
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
  const { label, required, placeHolder, helperText, calculationSteps, size } = element.extraAttributes;
  const isCalculated = Array.isArray(calculationSteps) && calculationSteps.length > 0;

  useEffect(() => {
    if (!isCalculated || typeof window === "undefined") return;

    const handler = () => {
      const newValue = evaluateCalculation(calculationSteps);
      setValue(newValue);
      if (submitValue) submitValue(element.id, newValue);
    };

    document.addEventListener("input", handler);
    handler();

    return () => document.removeEventListener("input", handler);
  }, [isCalculated, calculationSteps]);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);
  const {
    color,
    background,
    borderRadius,
    borderColor,
    borderWidth,
  } = element.extraAttributes;

  const style = {
    color,
    background,
    borderRadius,
    borderColor,
    borderWidth,
  } as React.CSSProperties;

  return (
    <div
      className={cn("flex w-full flex-col gap-2", getSizeClass(size))}

    > <div
      className="flex flex-col gap-2"
      style={{
        alignItems: getAlignment(element.extraAttributes.alignment),
      }}
    >
        <div style={{ width: element.extraAttributes.inputWidth }}>

          <Label className={cn(error && "text-red-500")} style={{ color: element.extraAttributes.color }}>
            {label}
            {required && "*"}
          </Label>
          <Input
            type="number"
            id={element.extraAttributes.customId || element.id}
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
            style={{ ...style }}
          />
          {helperText && (
            <p className={cn("text-[0.8rem] text-muted-foreground", error && "text-red-500")}>
              {helperText}
            </p>
          )}
        </div></div></div>
  );
}

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
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

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => e.preventDefault()}
        onBlur={form.handleSubmit((values) => {
          updateElement(element.id, {
            ...element,
            extraAttributes: { ...element.extraAttributes, ...values },
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
          name="customId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Field ID</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., user_email" />
              </FormControl>
              <FormDescription>
                Used for scripting: <code>document.getElementById(...)</code>
              </FormDescription>
              <FormMessage />
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
          name="inputWidth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Input Width</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., 100%, 300px" />
              </FormControl>
              <FormDescription>Set width like 100%, 300px etc.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="alignment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alignment</FormLabel>
              <FormControl>
                <select className="border rounded p-2 w-full" {...field}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </FormControl>
              <FormDescription>Horizontal alignment of the field</FormDescription>
              <FormMessage />
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
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Size</FormLabel>
              <FormControl>
                <select {...field} className="w-full border rounded-md px-2 py-1">
                  <option value="small">Small (col-span-3)</option>
                  <option value="medium">Medium (col-span-6)</option>
                  <option value="large">Large (col-span-12)</option>
                </select>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text Color</FormLabel>
              <FormControl>
                <Input type="color" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="background"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Color</FormLabel>
              <FormControl>
                <Input type="color" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="borderWidth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Border Width</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="borderColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Boredr Color</FormLabel>
              <FormControl>
                <Input type="color" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="borderRadius"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Boreder  Radius</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
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
                  {calculationSteps.map((step, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      {index > 0 && (
                        <select
                          value={step.operator || "+"}
                          onChange={(e) =>
                            form.setValue("calculationSteps", [
                              ...calculationSteps.slice(0, index),
                              { ...step, operator: e.target.value },
                              ...calculationSteps.slice(index + 1),
                            ])
                          }
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
                        onChange={(e) =>
                          form.setValue("calculationSteps", [
                            ...calculationSteps.slice(0, index),
                            { ...step, fieldId: e.target.value },
                            ...calculationSteps.slice(index + 1),
                          ])
                        }
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
                        onClick={() =>
                          form.setValue("calculationSteps", [
                            ...calculationSteps.slice(0, index),
                            ...calculationSteps.slice(index + 1),
                          ])
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      form.setValue("calculationSteps", [
                        ...calculationSteps,
                        { fieldId: "", operator: calculationSteps.length > 0 ? "+" : undefined },
                      ])
                    }
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
