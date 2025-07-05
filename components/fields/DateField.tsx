import { CalendarDays } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";

const type: ElementsType = "DateField";
const extraAttributes = {
  label: "Date field",
  helperText: "Pick a date",
  required: false,
  size: "medium",
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
  label: z.string().max(50),
  helperText: z.string().max(200),
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

export const DateFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: CalendarDays,
    label: "Date field",
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
  const { label, required, helperText } = element.extraAttributes;
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
    <div className={cn("w-full",)}>
      {/* Align the whole block (label + input + helper) */}
      <div
        className="flex flex-col gap-2"
        style={{
          alignItems: getAlignment(element.extraAttributes.alignment),
        }}
      >
        <div style={{ width: element.extraAttributes.inputWidth }}>
          <Label style={{ color: element.extraAttributes.color, marginBottom: '0.5rem' }}>
            {label}
            {required && "*"}
          </Label>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
            style={{ ...style }}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            <span>Pick a date</span>
          </Button>
          {helperText && (
            <p className="text-[0.8rem] text-muted-foreground">{helperText}</p>
          )}
        </div>
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
  const [date, setDate] = useState<Date | undefined>(
    defaultValue ? new Date(defaultValue) : undefined,
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const {
    label,
    required,
    helperText,
    size,
    color,
    background,
    borderRadius,
    borderColor,
    borderWidth,
    alignment,
    inputWidth,
    customId,
  } = element.extraAttributes;

  const sizeClass =
    size === "small" ? "col-span-3" : size === "medium" ? "col-span-6" : "col-span-12";

  const style: React.CSSProperties = {
    color,
    background,
    borderRadius,
    borderColor,
    borderWidth,
  };

  return (
    <div className={cn("w-full", sizeClass)}>
      <div
        className="flex flex-col gap-2"
        style={{
          alignItems: getAlignment(alignment),
        }}
      >
        <div style={{ width: inputWidth }}>
          {/* Label above input */}
          <Label
            className={cn("block", error && "text-red-500")}
            style={{ color, marginBottom: '0.5rem' }}
          >
            {label} {required && "*"}
          </Label>

          {/* Input (date picker) */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                  error && "border-red-500"
                )}
                style={style}
                id={customId || element.id}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {date ? format(date, "PP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => {
                  setDate(date);
                  if (!date) return;
                  const adjustedDate = new Date(date.getTime()); // create a copy
                  adjustedDate.setDate(adjustedDate.getDate() + 1);

                  const dateStr = adjustedDate.toISOString().split("T")[0]; // "YYYY-MM-DD"
                  console.log("✅ Selected date (+1 fix):", dateStr,date);

                  const watcher = (window as any)[`__fieldWatchers__${customId || element.id}`];
                  if (watcher) {
                    watcher(dateStr);
                  }

                  if (!submitValue) return;
                  const value = date?.toUTCString() ?? "";
                  const valid = DateFieldFormElement.validate(element, value);
                  setError(!valid);
                  submitValue(element.id, value);
                }}
              />
            </PopoverContent>
          </Popover>

          {/* Helper Text */}
          {helperText && (
            <p
              className={cn(
                "text-[0.8rem] text-muted-foreground mt-1",
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
      <form onSubmit={(e) => e.preventDefault()} onBlur={form.handleSubmit(applyChanges)}>
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={field.name}>Label</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>The label displayed above the field</FormDescription>
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
              <FormLabel htmlFor={field.name}>Helper text</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>The text displayed below the field</FormDescription>
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
                <FormLabel htmlFor={field.name}>Required</FormLabel>
                <FormDescription>Field is mandatory</FormDescription>
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
                  className="border p-2 rounded w-full"
                  value={field.value}
                  onChange={field.onChange}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </FormControl>
              <FormDescription>Choose the width of this field</FormDescription>
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
