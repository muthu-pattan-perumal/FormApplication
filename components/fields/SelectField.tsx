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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";

const type: ElementsType = "SelectField";
const extraAttributes = {
  label: "Select field",
  helperText: "Helper text",
  required: false,
  placeHolder: "Value here...",
  options: [],
  size: "medium" as "small" | "medium" | "large",
  inputWidth: "100%", // NEW
  alignment: "left" as "left" | "center" | "right", // NEW
   color: "#000000",
   background: "white",
  borderRadius: "5px",
  borderColor: "gray",
  borderWidth: "1px",
};
function getAlignment(alignment: "left" | "center" | "right") {
  return {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  }[alignment];
}

const propertiesSchema = z.object({
  label: z.string().max(200),
  helperText: z.string().max(50),
  required: z.boolean().default(false),
  placeHolder: z.string().max(50),
  options: z.array(z.string()).default([]),
  size: z.enum(["small", "medium", "large"]).default("medium"),
  inputWidth: z.string().default("100%"), // NEW
  alignment: z.enum(["left", "center", "right"]).default("left"), // NEW
  color: z.string().optional(),
    background: z.string().optional(),
    borderRadius: z.string().optional(),
    borderColor: z.string().optional(),
    borderWidth: z.string().optional(),
});

export const SelectFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: PanelTopOpen,
    label: "Select field",
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

function getSizeClass(size: "small" | "medium" | "large" = "medium") {
  switch (size) {
    case "small":
      return "col-span-3";
    case "medium":
      return "col-span-6";
    case "large":
      return "col-span-12";
  }
}

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

type PropertiesFormSchemaType = z.infer<typeof propertiesSchema>;

function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { label, required, placeHolder, helperText, size } = element.extraAttributes;
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
    <div className={cn("w-full", getSizeClass(size))} >
      <div
        className="flex flex-col gap-2"
        style={{ alignItems: getAlignment(element.extraAttributes.alignment) }}
      >
        <div style={{ width: element.extraAttributes.inputWidth }}>
          <Label style={{color:element.extraAttributes.color}}>
            {label}
            {required && "*"}
          </Label>
          <Select>
            <SelectTrigger className="w-full"  style={{ ...style }}>
              <SelectValue placeholder={placeHolder} />
            </SelectTrigger>
          </Select>
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
  const [value, setValue] = useState(defaultValue || "");
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const { label, required, placeHolder, helperText, options, size } =
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
        className="flex flex-col gap-2"
        style={{ alignItems: getAlignment(element.extraAttributes.alignment) }}
      >
        <div style={{ width: element.extraAttributes.inputWidth }}  >
          <Label className={cn(error && "text-red-500")} style={{color:element.extraAttributes.color}}>
            {label}
            {required && "*"}
          </Label>
          <Select
            defaultValue={value}
            onValueChange={(value) => {
              setValue(value);
              if (!submitValue) return;
              const valid = SelectFieldFormElement.validate(element, value);
              setError(!valid);
              submitValue?.(element.id, value);
            }}
          >
            <SelectTrigger className={cn("w-full", error && "border-red-500")}  style={{ ...style }}>
              <SelectValue placeholder={placeHolder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {helperText && (
            <p className={cn("text-[0.8rem] text-muted-foreground", error && "text-red-500")}>
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
  const element = elementInstance as CustomInstance;
  const { updateElement, setSelectedElement } = useDesigner();
  const form = useForm<PropertiesFormSchemaType>({
    resolver: zodResolver(propertiesSchema),
    mode: "onSubmit",
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
    toast({
      title: "Success",
      description: "Properties saved successfully",
    });
    setSelectedElement(null);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(applyChanges)}>
        {(["label", "placeHolder", "helperText"] as const).map((name) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{name}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <Separator />
        <FormField
          control={form.control}
          name="options"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Options</FormLabel>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    form.setValue("options", field.value.concat("New option"));
                  }}
                >
                  <Plus /> Add
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {form.watch("options").map((option, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-1"
                  >
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...field.value];
                        newOptions[idx] = e.target.value;
                        field.onChange(newOptions);
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        const newOptions = [...field.value];
                        newOptions.splice(idx, 1);
                        field.onChange(newOptions);
                      }}
                    >
                      <X />
                    </Button>
                  </div>
                ))}
              </div>
            </FormItem>
          )}
        />

        <Separator />
        <FormField
          control={form.control}
          name="required"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Required</FormLabel>
                <FormDescription>
                  The required state of the field.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Separator />
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
            </FormItem>
          )}
        />
        <Separator />

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
        <Separator />
        <Button type="submit" className="w-full">
          Save
        </Button>
      </form>
    </Form>
  );
}