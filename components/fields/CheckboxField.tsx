import { CheckSquare } from "lucide-react";
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
import { Checkbox } from "../ui/checkbox";

const type: ElementsType = "CheckboxField";

const extraAttributes = {
  label: "Checkbox field",
  helperText: "Helper text",
  required: false,
  size: "medium" as "small" | "medium" | "large",
  customId: "",
  inputWidth: "100%", // NEW
  alignment: "left" as "left" | "center" | "right", // NEW
  color: "#000000",
  background: "white",
  borderRadius: "5px",
  borderColor: "gray",
  borderWidth: "1px",
};

const propertiesSchema = z.object({
  customId: z.string().max(100).optional(),
  label: z.string().max(200),
  helperText: z.string().max(50),
  required: z.boolean().default(false),
  size: z.enum(["small", "medium", "large"]).default("medium"),
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

export const CheckboxFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: CheckSquare,
    label: "Checkbox field",
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (formElement: FormElementInstance, currentValue: string) => {
    const element = formElement as CustomInstance;
    if (element.extraAttributes.required) {
      return currentValue === "true";
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
  const { label, required, helperText, size } = element.extraAttributes;
  const id = `checkbox-${element.id}`;
  const sizeClass = {
    small: "col-span-3",
    medium: "col-span-6",
    large: "col-span-12",
  }[size];
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
      className={cn("items-top flex space-x-2", sizeClass)}
      style={{
        width: element.extraAttributes.inputWidth,
        alignItems: getAlignment(element.extraAttributes.alignment),
      }}
    >
      <Checkbox id={id} disabled />
      <div className="grid gap-1.5 leading-none">
        <Label style={{ color: element.extraAttributes.color }}>
          {label}
          {required && "*"}
        </Label>
        {helperText && (
          <p className="text-[0.8rem] text-muted-foreground">{helperText}</p>
        )}
      </div>
    </div>
  );
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
  const [value, setValue] = useState<boolean>(defaultValue === "true");
  const [error, setError] = useState(false);
  const { label, required, helperText, size } = element.extraAttributes;
  const id = `checkbox-${element.id}`;
  const sizeClass = {
    small: "col-span-3",
    medium: "col-span-6",
    large: "col-span-12",
  }[size];

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

    <div className={cn("w-full", sizeClass)}>
      {/* Alignment wrapper */}
      <div
        className="flex justify-start"
        style={{
          justifyContent: getAlignment(element.extraAttributes.alignment),
        }}
      >
        {/* Inner block with fixed width */}
        <div
          className="items-top flex space-x-2"
          style={{
            width: element.extraAttributes.inputWidth,
            marginTop: "1rem",
          }}
        >
          <Checkbox
            id={element.extraAttributes.customId || element.id}
            checked={value}
            className={cn(error && "border-red-500")}
            onCheckedChange={(value) => {
              setValue(value === true);
               const watcher = (window as any)[`__fieldWatchers__${element.extraAttributes.customId || element.id}`];
                if (watcher) {
                  watcher(value === true);
                }
              const valid = CheckboxFieldFormElement.validate(
                element,
                value ? "true" : "false"
              );
              setError(!valid);
              submitValue?.(element.id, value.toString());
            }}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor={id} className={cn(error && "text-red-500")} style={{ color: element.extraAttributes.color }}>
              {label}
              {required && "*"}
            </Label>
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
    </div>

  );

}

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
              <FormDescription>This will be shown next to the checkbox.</FormDescription>
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
          name="helperText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Helper text</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>This will appear below the checkbox.</FormDescription>
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
                <FormDescription>Should the field be required?</FormDescription>
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
          name="inputWidth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Input Width</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., 100%, 200px, 50%" />
              </FormControl>
              <FormDescription>Custom width for the checkbox container</FormDescription>
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
                <select
                  {...field}
                  className="w-full border rounded p-2"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </FormControl>
              <FormDescription>Align the checkbox group horizontally</FormDescription>
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
        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Size</FormLabel>
              <FormControl>
                <select
                  value={field.value}
                  onChange={field.onChange}
                  className="w-full border rounded p-2"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </FormControl>
              <FormDescription>How wide this checkbox should span.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
