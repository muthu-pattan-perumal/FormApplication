"use client";

import * as z from "zod";
import { useEffect, useState } from "react";
import {
  ElementsType,
  FormElement,
  FormElementInstance,
} from "../FormElements";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import useDesigner from "../hooks/useDesigner";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

const type: ElementsType = "ScriptButton";

const extraAttributes = {
  label: "Run Script",
  backgroundColor: "#1d4ed8",
  textColor: "#ffffff",
  borderRadius: "8px",
  borderSize: "1px",
  borderColor: "#000000",
  padding: "8px 16px",
  margin: "0px",
  size: "medium" as "small" | "medium" | "large",
  alignment: "left" as "left" | "center" | "right", // ✅ Add this line
  script: ``,
};
function getAlignment(alignment: "left" | "center" | "right") {
  return {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  }[alignment];
}
const propertiesSchema = z.object({
  label: z.string(),
  backgroundColor: z.string(),
  textColor: z.string(),
  borderRadius: z.string(),
  borderSize: z.string(),
  borderColor: z.string(),
  padding: z.string(),
  margin: z.string(),
  size: z.enum(["small", "medium", "large"]),
  alignment: z.enum(["left", "center", "right"]), // ✅ Add this line
  script: z.string(),
});

type PropertiesFormSchemaType = z.infer<typeof propertiesSchema>;

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

export const ScriptButtonFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: () => "🔘",
    label: "Script Button",
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: () => true,
};

function getSizeClass(size: "small" | "medium" | "large") {
  return {
    small: "col-span-3",
    medium: "col-span-6",
    large: "col-span-12",
  }[size];
}

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const {
    size,
    alignment,
    backgroundColor,
    textColor,
    borderRadius,
    borderSize,
    borderColor,
    padding,
    margin,
    label,
  } = element.extraAttributes;

  const buttonStyle: React.CSSProperties = {
    backgroundColor,
    color: textColor,
    borderRadius,
    border: `${borderSize} solid ${borderColor}`,
    padding,
    margin,
  };

  return (
    <div className={cn(getSizeClass(size))} style={{width:'-webkit-fill-available'}}>
      <div
        className="flex w-full"
        style={{
          justifyContent: getAlignment(alignment), // ✅ Aligns left/center/right
        }}
      >
        <button
          disabled
          className="flex items-center justify-center gap-2"
          style={buttonStyle}
        >
          {label}
        </button>
      </div>
    </div>
  );
}


function FormComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      // eslint-disable-next-line no-new-func
      const func = new Function(element.extraAttributes.script);
      await func();
    } catch (err) {
      alert("Script error: " + err);
    } finally {
      setLoading(false);
    }
  };
  //   const handleClick = async () => {
  //     try {
  //       // eslint-disable-next-line no-new-func
  //       const func = new Function(element.extraAttributes.script);
  //       await func();
  //     } catch (err) {
  //       alert("Script error: " + err);
  //     }
  //   };

  return (
    <div className={cn(getSizeClass(element.extraAttributes.size))}>
      <div
        className="flex w-full"
        style={{ justifyContent: getAlignment(element.extraAttributes.alignment) }}
      >
        <button
          className="w-auto flex items-center justify-center gap-2"
          style={{
            backgroundColor: element.extraAttributes.backgroundColor,
            color: element.extraAttributes.textColor,
            borderRadius: element.extraAttributes.borderRadius,
            border: `${element.extraAttributes.borderSize} solid ${element.extraAttributes.borderColor}`,
            padding: element.extraAttributes.padding,
            margin: element.extraAttributes.margin,
          }}
          onClick={handleClick}
          disabled={loading}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {element.extraAttributes.label}
        </button>
      </div>
    </div>

  );
}

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const { updateElement } = useDesigner();
  const element = elementInstance as CustomInstance;

  const form = useForm<PropertiesFormSchemaType>({
    resolver: zodResolver(propertiesSchema),
    mode: "onBlur",
    defaultValues: element.extraAttributes,
  });

  useEffect(() => {
    form.reset(element.extraAttributes);
  }, [element]);

  const applyChanges = (values: PropertiesFormSchemaType) => {
    updateElement(element.id, {
      ...element,
      extraAttributes: values,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} onBlur={form.handleSubmit(applyChanges)} className="space-y-4">
        {Object.keys(extraAttributes).map((key) => {
          if (key === "size") {
            return (
              <FormField
                key={key}
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full rounded border px-2 py-1">
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />
            );
          }
          <FormField
            key="alignment"
            control={form.control}
            name="alignment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alignment</FormLabel>
                <FormControl>
                  <select {...field} className="w-full rounded border px-2 py-1">
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </FormControl>
              </FormItem>
            )}
          />
    if (key === "backgroundColor") {
            return (
              <FormField
                key={key}
                control={form.control}
                name="backgroundColor"
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
            );
          }
          if (key === "script") {
            return (
              <FormField
                key={key}
                control={form.control}
                name="script"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Script</FormLabel>
                    <FormControl>
                      <Textarea rows={10} {...field} />
                    </FormControl>
                    <FormDescription>Write JS script here.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          }
          return (
            <FormField
              key={key}
              control={form.control}
              name={key as keyof PropertiesFormSchemaType}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">{key.replace(/([A-Z])/g, " $1")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
      </form>
    </Form>
  );
}
