import { Type } from "lucide-react";
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

// ✅ Define element type and defaults
const type: ElementsType = "TextField";
const extraAttributes = {
  label: "Text field",
  helperText: "Helper text",
  required: false,
  placeHolder: "Value here...",
  size: "medium" as "small" | "medium" | "large",
  customId: "",
  inputType: "text" as "text" | "email" | "password", // NEW
  inputWidth: "100%", // NEW
  alignment: "left" as "left" | "center" | "right", // NEW
  color: "#000000",
  background: "white",
  borderRadius: "5px",
  borderColor: "gray",
  borderWidth: "1px",
};

// ✅ Define Zod schema with size enum
const propertiesSchema = z.object({
  customId: z.string().max(100).optional(), // ✅ NEW
  label: z.string().max(200),
  helperText: z.string().max(50),
  required: z.boolean().default(false),
  placeHolder: z.string().max(50),
  size: z.enum(["small", "medium", "large"]).default("medium"),
  inputType: z.enum(["text", "email", "password"]).default("text"), // NEW
  inputWidth: z.string().default("100%"), // NEW
  alignment: z.enum(["left", "center", "right"]).default("left"), // NEW
  color: z.string().optional(),
  background: z.string().optional(),
  borderRadius: z.string().optional(),
  borderColor: z.string().optional(),
  borderWidth: z.string().optional(),
});

// ✅ Map size to Tailwind CSS col-span class
function getSizeClass(size: "small" | "medium" | "large") {
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

// ✅ Element definition
export const TextFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: Type,
    label: "Text field",
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (formElement, currentValue) => {
    const { required, inputType } = (formElement as CustomInstance).extraAttributes;
    if (required && !currentValue) return false;
    if (inputType === "email" && !/^\S+@\S+\.\S+$/.test(currentValue)) return false;
    return true;
  },

};

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

type PropertiesFormSchemaType = z.infer<typeof propertiesSchema>;

// ✅ Designer Preview
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
    <div className={cn("w-full", getSizeClass(size))}>
      <div
        className="flex justify-center" // control horizontal alignment of the entire block
        style={{
          justifyContent: getAlignment(element.extraAttributes.alignment),
        }}
      >
        {/* Fixed-width block to align label/input/helper consistently */}
        <div className="flex flex-col gap-2" style={{ width: element.extraAttributes.inputWidth }}>
          <Label style={{ color: element.extraAttributes.color }}>
            {label}
            {required && "*"}
          </Label>
          <Input readOnly disabled placeholder={placeHolder} style={{ ...style }} />
          {helperText && (
            <p className="text-[0.8rem] text-muted-foreground">{helperText}</p>
          )}
        </div>
      </div>
    </div>

  );
}
function getAlignment(alignment: "left" | "center" | "right") {
  return {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  }[alignment];
}

// ✅ Rendered Form Input
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

  // Allow external updates
  useEffect(() => {
    setValue(defaultValue || "");
  }, [defaultValue]);

  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { inputType } = element.extraAttributes;
  const actualInputType = inputType === "password" ? (showPassword ? "text" : "password") : inputType;

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let isValid = true;

    if (required && !value) isValid = false;
    if (inputType === "email" && !/^\S+@\S+\.\S+$/.test(value)) isValid = false;

    setError(!isValid);
    if (submitValue && isValid) submitValue(element.id, value);
  };
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
  const { label, required, placeHolder, helperText, size } =
    element.extraAttributes;

  return (
    <div className={cn("w-full", getSizeClass(size))}>
      <div
        className="flex justify-center" // control horizontal alignment of the entire block
        style={{
          justifyContent: getAlignment(element.extraAttributes.alignment),
        }}
      >
        {/* Fixed-width block to align label/input/helper consistently */}
        <div className="flex flex-col gap-2" style={{ width: element.extraAttributes.inputWidth }} >
          <Label className={cn(error && "text-red-500")} style={{ color: element.extraAttributes.color }}>
            {label}
            {required && "*"}
          </Label>

          <div className="relative">
            <Input
              id={element.extraAttributes.customId || element.id}
              type={actualInputType}
              value={value}
              className={cn(error && "border-red-500")}
              placeholder={placeHolder}
              onChange={(e) => {
                const watcher = (window as any)[`__fieldWatchers__${element.extraAttributes.customId || element.id}`];
                if (watcher) {
                  watcher(e.target.value);
                }
                setValue(e.target.value)
              }}
              onBlur={handleBlur}
              style={{ ...style }}
            />
            {inputType === "password" && (
              <button
                type="button"
                className="absolute right-2 top-2 text-sm text-muted-foreground"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            )}
          </div>

          {helperText && (
            <p
              className={cn(
                "text-[0.8rem] text-muted-foreground",
                error && "text-red-500"
              )}
            >
              {helperText}
            </p>
          )}
        </div>
      </div>
    </div>


  );
}

// ✅ Settings Panel
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
    defaultValues: element.extraAttributes,
  });

  useEffect(() => {
    form.reset(element.extraAttributes);
  }, [element, form]);

  function applyChanges(values: PropertiesFormSchemaType) {
    updateElement(element.id, {
      ...element,
      extraAttributes: values,
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
          name="inputType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field Type</FormLabel>
              <div className="flex gap-4">
                {["text", "email", "password"].map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="radio"
                      value={type}
                      checked={field.value === type}
                      onChange={() => field.onChange(type)}
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
              <FormDescription>
                Choose the type of this text field.
              </FormDescription>
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
              <FormDescription>Displayed inside the input</FormDescription>
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
              <FormDescription>Displayed below the field</FormDescription>
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
                <Input {...field} placeholder="e.g., 100%, 200px, 50%" />
              </FormControl>
              <FormDescription>Custom CSS width for the input field</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="alignment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field Alignment</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full border rounded-md px-2 py-1 bg-background text-foreground"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </FormControl>
              <FormDescription>Align input within the grid column</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="required"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div>
                <FormLabel>Required</FormLabel>
                <FormDescription>Must be filled in the form</FormDescription>
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
              <FormDescription>
                Controls the width of this field on the grid
              </FormDescription>
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
