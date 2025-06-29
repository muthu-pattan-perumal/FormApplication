import { TextSelect } from "lucide-react";
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
import { Textarea } from "../ui/textarea";
import { Slider } from "../ui/slider";

// ✅ Type and attributes
const type: ElementsType = "TextAreaField";
const extraAttributes = {
  label: "Text area",
  helperText: "Helper text",
  required: false,
  placeHolder: "Value here...",
  rows: 3,
  size: "medium" as "small" | "medium" | "large", // ✅ Added size
  customId: "",
  inputWidth: "100%", // NEW
  alignment: "left" as "left" | "center" | "right", // NEW
  color: "#000000",
   background: "white",
  borderRadius: "5px",
  borderColor: "gray",
  borderWidth: "1px",
};

// ✅ Schema updated with `size`
const propertiesSchema = z.object({
  customId: z.string().max(100).optional(),
  label: z.string().max(200),
  helperText: z.string().max(50),
  required: z.boolean().default(false),
  placeHolder: z.string().max(50),
  rows: z.number().min(1).max(10).default(3),
  size: z.enum(["small", "medium", "large"]).default("medium"), // ✅ Added
   inputWidth: z.string().default("100%"), // NEW
  alignment: z.enum(["left", "center", "right"]).default("left"), // NEW
    color: z.string().optional(),
      background: z.string().optional(),
      borderRadius: z.string().optional(),
      borderColor: z.string().optional(),
      borderWidth: z.string().optional(),
});
function getAlignment(alignment: "left" | "center" | "right") {
  return {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  }[alignment];
}

export const TextAreaFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: TextSelect,
    label: "Text area",
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
  extraAttributes: typeof extraAttributes;
};

type PropertiesFormSchemaType = z.infer<typeof propertiesSchema>;

// ✅ Helper for Tailwind class mapping
function getSizeClass(size: "small" | "medium" | "large" = "medium") {
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
}

// ✅ Updated to include size class
function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { label, required, placeHolder, helperText, size } =
    element.extraAttributes;
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
    <div className={cn("flex flex-col gap-2 w-full", getSizeClass(size))}>
      <div
    className="flex flex-col gap-2"
    style={{
      alignItems: getAlignment(element.extraAttributes.alignment),
    }}
  >
    <div style={{ width: element.extraAttributes.inputWidth }}>

      <Label style={{color:element.extraAttributes.color}}>
        {label}
        {required && "*"}
      </Label>
      <Textarea readOnly disabled placeholder={placeHolder} style={style} />
      {helperText && (
        <p className="text-[0.8rem] text-muted-foreground">{helperText}</p>
      )}
    </div></div></div>
  );
}

// ✅ Updated to include size class
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

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const { label, required, placeHolder, helperText, rows, size } =
    element.extraAttributes;
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
      <Label className={cn(error && "text-red-500")} style={{color:element.extraAttributes.color}}>
        {label}
        {required && "*"}
      </Label>
      <Textarea
        id={element.extraAttributes.customId || element.id}
        rows={rows}
        className={cn(error && "border-red-500")}
        placeholder={placeHolder}
        onChange={(e) => setValue(e.target.value)}
        onBlur={(e) => {
          if (!submitValue) return;

          const valid = TextAreaFieldFormElement.validate(
            element,
            e.target.value,
          );
          setError(!valid);
          if (!valid) return;
          submitValue(element.id, e.target.value);
        }}
        value={value}
        style={style}
      />
      {helperText && (
        <p
          className={cn(
            "text-[0.8rem] text-muted-foreground",
            error && "text-red-500",
          )}
        >
          {helperText}
        </p>
      )}
    </div></div></div>
  );
}

// ✅ Updated to include size field in settings form
function PropertiesComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const { updateElement } = useDesigner();
  const element = elementInstance as CustomInstance;
  const form = useForm<PropertiesFormSchemaType>({
    resolver: zodResolver(propertiesSchema),
    mode: "onBlur",
    defaultValues: {
      label: element.extraAttributes.label,
      helperText: element.extraAttributes.helperText,
      required: element.extraAttributes.required,
      placeHolder: element.extraAttributes.placeHolder,
      rows: element.extraAttributes.rows,
      size: element.extraAttributes.size || "medium", // ✅
    },
  });

  useEffect(() => {
    form.reset(element.extraAttributes);
  }, [element, form]);

  function applyChanges(values: PropertiesFormSchemaType) {
    updateElement(element.id, {
      ...element,
      extraAttributes: { ...values },
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => e.preventDefault()}
        onBlur={form.handleSubmit(applyChanges)}
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
              <FormDescription>Displayed above the field</FormDescription>
              <FormMessage />
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
              <FormDescription>Displayed in the field</FormDescription>
              <FormMessage />
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
              <FormLabel>Helper Text</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Shown below the field</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rows"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rows ({form.watch("rows")})</FormLabel>
              <FormControl>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  defaultValue={[field.value]}
                  onValueChange={(val) => field.onChange(val[0])}
                />
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
                <FormDescription>Make this field mandatory</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* ✅ Size Field */}
        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Size</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full border rounded-md px-2 py-1 bg-background text-foreground"
                >
                  <option value="small">Small (col-span-3)</option>
                  <option value="medium">Medium (col-span-6)</option>
                  <option value="large">Large (col-span-12)</option>
                </select>
              </FormControl>
              <FormDescription>Column span in layout</FormDescription>
              <FormMessage />
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
      </form>
    </Form>
  );
}
