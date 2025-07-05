// FULL MODIFIED CODE WITH DYNAMIC window.setFieldOptions AND window.setFieldValue SUPPORT

"use client";

import { PanelTopOpen, Plus, X } from "lucide-react";
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
  FormField,
  FormItem,
  FormLabel,
} from "../ui/form";
import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Checkbox } from "../ui/checkbox";

declare global {
  interface Window {
    setFieldOptions?: (customId: string, options: { label: string; value: string; value2?: string }[]) => void;
    setFieldValue?: (customId: string, value: string) => void;
  }
}

const type: ElementsType = "SelectField";

const extraAttributes = {
  label: "Select field",
  helperText: "Helper text",
  required: false,
  placeHolder: "Value here...",
  options: [] as { label: string; value: string; value2?: string }[],
  size: "medium" as "small" | "medium" | "large",
  inputWidth: "100%",
  alignment: "left" as "left" | "center" | "right",
  color: "#000000",
  background: "#ffffff",
  borderRadius: "5px",
  borderColor: "#cccccc",
  borderWidth: "1px",
  multiSelect: false,
  customId: "",
  targetFieldId: "",
  targetFieldId2: "",
};

const propertiesSchema = z.object({
  label: z.string().max(200),
  helperText: z.string().max(50),
  required: z.boolean().default(false),
  placeHolder: z.string().max(50),
  options: z.array(z.object({ label: z.string(), value: z.string(), value2: z.string().optional() })).default([]),
  size: z.enum(["small", "medium", "large"]).default("medium"),
  inputWidth: z.string().default("100%"),
  alignment: z.enum(["left", "center", "right"]).default("left"),
  color: z.string().optional(),
  background: z.string().optional(),
  borderRadius: z.string().optional(),
  borderColor: z.string().optional(),
  borderWidth: z.string().optional(),
  multiSelect: z.boolean().default(false),
  customId: z.string().optional(),
  targetFieldId: z.string().optional(),
  targetFieldId2: z.string().optional(),
});

export const SelectFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({ id, type, extraAttributes }),
  designerBtnElement: { icon: PanelTopOpen, label: "Select field" },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (formElement: FormElementInstance, currentValue: string) => {
    const element = formElement as CustomInstance;
    return element.extraAttributes.required ? currentValue.length > 0 : true;
  },
};

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { label, required, placeHolder, helperText, size } = element.extraAttributes;
  const style = {
    color: element.extraAttributes.color,
    background: element.extraAttributes.background,
    borderRadius: element.extraAttributes.borderRadius,
    borderColor: element.extraAttributes.borderColor,
    borderWidth: element.extraAttributes.borderWidth,
  } as React.CSSProperties;

  return (
    <div className={cn("w-full", getSizeClass(size))}>
      <div className="flex flex-col gap-2" style={{ alignItems: getAlignment(element.extraAttributes.alignment) }}>
        <div style={{ width: element.extraAttributes.inputWidth }}>
          <Label style={{ color: element.extraAttributes.color }}>{label} {required && "*"}</Label>
          <Select>
            <SelectTrigger className="w-full" style={style}>
              <SelectValue placeholder={placeHolder} />
            </SelectTrigger>
          </Select>
          {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
        </div>
      </div>
    </div>
  );
}

function getSizeClass(size: "small" | "medium" | "large") {
  return {
    small: "col-span-3",
    medium: "col-span-6",
    large: "col-span-12",
  }[size];
}

function getAlignment(alignment: "left" | "center" | "right") {
  return {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  }[alignment];
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
  const [options, setOptions] = useState(element.extraAttributes.options || []);
  const [error, setError] = useState(false);
  const {
    label,
    required,
    placeHolder,
    helperText,
    size,
    multiSelect,
    targetFieldId,
    targetFieldId2,
    customId,
  } = element.extraAttributes;

  useEffect(() => setError(isInvalid === true), [isInvalid]);

  useEffect(() => {
    // Register global dynamic updaters
    window.setFieldOptions = (id, newOptions) => {
      if (id === customId) setOptions(newOptions);
    };
    window.setFieldValue = (id, val) => {
      if (id === customId) setValue(val);
    };
  }, [customId]);

  const style = {
    color: element.extraAttributes.color,
    background: element.extraAttributes.background,
    borderRadius: element.extraAttributes.borderRadius,
    borderColor: element.extraAttributes.borderColor,
    borderWidth: element.extraAttributes.borderWidth,
  } as React.CSSProperties;

  const handleSingleChange = (val: string) => {
    setValue(val);
    const selected = options.find((o) => o.value === val);
    submitValue?.(element.id, val);
    const watcher = (window as any)[`__fieldWatchers__${customId || element.id}`];
    if (watcher) {
      watcher(val);
    }
    if (targetFieldId && selected) {
      const input = document.getElementById(targetFieldId) as HTMLInputElement;
      if (input) input.value = selected.value;
      submitValue?.(targetFieldId, selected.value);
    }
    if (targetFieldId2 && selected) {
      const input2 = document.getElementById(targetFieldId2) as HTMLInputElement;
      if (input2) input2.value = selected.value2 || "";
      submitValue?.(targetFieldId2, selected.value2 || "");
    }
  };

  const handleMultiChange = (val: string) => {
    const currentValues = value.split(",").filter(Boolean);
    const exists = currentValues.includes(val);
    const newValues = exists ? currentValues.filter((v) => v !== val) : [...currentValues, val];
    const finalValue = newValues.join(",");
    const watcher = (window as any)[`__fieldWatchers__${customId || element.id}`];
    if (watcher) {
      watcher(finalValue);
    }
    setValue(finalValue);
    submitValue?.(element.id, finalValue);
  };

  return (
    <div className={cn("w-full", getSizeClass(size))}>
      <div className="flex flex-col gap-2" style={{ alignItems: getAlignment(element.extraAttributes.alignment) }}>
        <div style={{ width: element.extraAttributes.inputWidth }}>
          <Label className={error ? "text-red-500" : ""} style={{ color: element.extraAttributes.color }}>
            {label} {required && "*"}
          </Label>

          {multiSelect ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start", error && "border-red-500")}
                  id={customId}
                  style={style}
                >
                  {value
                    .split(",")
                    .map((val) => options.find((o) => o.value === val)?.label)
                    .filter(Boolean)
                    .join(", ") || placeHolder}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] max-h-[300px] overflow-y-auto">
                <div className="flex flex-col gap-2">
                  {options.map((opt) => {
                    const selected = value.split(",").includes(opt.value);
                    return (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => handleMultiChange(opt.value)}
                        />
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Select value={value} onValueChange={handleSingleChange}>
              <SelectTrigger className={cn("w-full", error && "border-red-500")} style={style}>
                <SelectValue id={customId} placeholder={placeHolder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {helperText && (
            <p className={cn("text-xs", error ? "text-red-500" : "text-muted-foreground")}>{helperText}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { updateElement, setSelectedElement } = useDesigner();
  const form = useForm<z.infer<typeof propertiesSchema>>({
    resolver: zodResolver(propertiesSchema),
    defaultValues: element.extraAttributes,
  });

  useEffect(() => form.reset(element.extraAttributes), [element, form]);

  function apply(values: z.infer<typeof propertiesSchema>) {
    updateElement(element.id, { ...element, extraAttributes: values });
    toast({ title: "Saved" });
    setSelectedElement(null);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(apply)} className="space-y-4">
        {(["label", "placeHolder", "helperText", "customId", "targetFieldId", "targetFieldId2"] as const).map((key) => (
          <FormField
            key={key}
            control={form.control}
            name={key}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{key}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        ))}

        <FormField
          control={form.control}
          name="required"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Required</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="multiSelect"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Multi Select</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                <select {...field} className="input">
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inputWidth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Width</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
                <select {...field} className="input">
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField control={form.control} name="color" render={({ field }) => (
          <FormItem>
            <FormLabel>Text Color</FormLabel>
            <FormControl><Input type="color" {...field} /></FormControl>
          </FormItem>
        )} />
        <FormField control={form.control} name="background" render={({ field }) => (
          <FormItem>
            <FormLabel>Background</FormLabel>
            <FormControl><Input type="color" {...field} /></FormControl>
          </FormItem>
        )} />
        <FormField control={form.control} name="borderRadius" render={({ field }) => (
          <FormItem>
            <FormLabel>Border Radius</FormLabel>
            <FormControl><Input {...field} /></FormControl>
          </FormItem>
        )} />
        <FormField control={form.control} name="borderColor" render={({ field }) => (
          <FormItem>
            <FormLabel>Border Color</FormLabel>
            <FormControl><Input type="color" {...field} /></FormControl>
          </FormItem>
        )} />
        <FormField control={form.control} name="borderWidth" render={({ field }) => (
          <FormItem>
            <FormLabel>Border Width</FormLabel>
            <FormControl><Input {...field} /></FormControl>
          </FormItem>
        )} />

        <FormField
          control={form.control}
          name="options"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Options</FormLabel>
              <div className="space-y-2">
                {field.value.map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input value={opt.label} onChange={(e) => {
                      const updated = [...field.value];
                      updated[i].label = e.target.value;
                      field.onChange(updated);
                    }} placeholder="Label" />
                    <Input value={opt.value} onChange={(e) => {
                      const updated = [...field.value];
                      updated[i].value = e.target.value;
                      field.onChange(updated);
                    }} placeholder="Value" />
                    <Input value={opt.value2 || ""} onChange={(e) => {
                      const updated = [...field.value];
                      updated[i].value2 = e.target.value;
                      field.onChange(updated);
                    }} placeholder="Value 2" />
                    <Button type="button" size="icon" variant="ghost" onClick={() => {
                      const updated = [...field.value];
                      updated.splice(i, 1);
                      field.onChange(updated);
                    }}><X className="w-4 h-4" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => field.onChange([...field.value, { label: "", value: "" }])}>
                  <Plus className="w-4 h-4 mr-1" /> Add Option
                </Button>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}

// Register global function to update options dynamically

