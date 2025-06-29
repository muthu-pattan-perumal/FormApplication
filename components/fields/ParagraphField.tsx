import { Text } from "lucide-react";
import * as z from "zod";
import {
  ElementsType,
  FormElement,
  FormElementInstance,
} from "../FormElements";
import { Label } from "../ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import useDesigner from "../hooks/useDesigner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

const type: ElementsType = "ParagraphField";

const FontFamilies = ["Arial", "Times New Roman", "Courier New", "Verdana"];

const extraAttributes = {
  text: "Paragraph field",
  size: "medium" as "small" | "medium" | "large",
  marginTop: "0px",
  marginBottom: "0px",
  marginLeft: "0px",
  marginRight: "0px",
  showColumn: true,
  fontSize: "18px",
  fontFamily: "Arial",
  fontWeight: "normal",
  color: "#000000",
};

const propertiesSchema = z.object({
  text: z.string().min(2).max(500),
  size: z.enum(["small", "medium", "large"]).default("medium"),
  marginTop: z.string().optional(),
  marginBottom: z.string().optional(),
  marginLeft: z.string().optional(),
  marginRight: z.string().optional(),
  showColumn: z.boolean().default(true),
  fontSize: z.string().optional(),
  fontFamily: z.string().optional(),
  fontWeight: z.string().optional(),
  color: z.string().optional(),
});

export const ParagraphFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: Text,
    label: "Paragraph field",
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: () => true,
};

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

type PropertiesFormSchemaType = z.infer<typeof propertiesSchema>;

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

function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const {
    text,
    size,
    showColumn,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    fontSize,
    fontFamily,
    fontWeight,
    color,
  } = element.extraAttributes;

  const style = {
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    fontFamily,
    fontSize,
    fontWeight,
    color,
  } as React.CSSProperties;

  if (!showColumn) return null;

  return (
    <div className={cn("flex w-full flex-col gap-2", getSizeClass(size))} style={style}>
      <Label className="text-muted-foreground">Paragraph field</Label>
      <p>{text}</p>
    </div>
  );
}

function FormComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const {
    text,
    size,
    showColumn,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    fontSize,
    fontFamily,
    fontWeight,
    color,
  } = element.extraAttributes;

  const style = {
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    fontFamily,
    fontSize,
    fontWeight,
    color,
  } as React.CSSProperties;

  if (!showColumn) return null;

  return <p className={getSizeClass(size)} style={style}>{text}</p>;
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

  const applyChanges = (values: PropertiesFormSchemaType) => {
    updateElement(element.id, {
      ...element,
      extraAttributes: values,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => e.preventDefault()}
        onBlur={form.handleSubmit(applyChanges)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text</FormLabel>
              <FormControl>
                <Textarea rows={5} {...field} />
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
                <select {...field} className="w-full border rounded-md px-2 py-1">
                  <option value="small">Small (col-span-3)</option>
                  <option value="medium">Medium (col-span-6)</option>
                  <option value="large">Large (col-span-12)</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="showColumn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Show Column</FormLabel>
              <FormControl>
                <input type="checkbox" checked={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

         {(["marginTop", "marginBottom", "marginLeft", "marginRight"] as const).map(
          (marginField) => (
            <FormField
              key={marginField}
              control={form.control}
              name={marginField}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{
                    marginField
                      .replace("margin", "Margin ")
                      .replace(/([A-Z])/, " $1")
                  }</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 10px" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )
        )}

        <FormField
          control={form.control}
          name="fontSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Font Size (e.g. 18px)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 16px or 1.5rem" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fontFamily"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Font Family</FormLabel>
              <FormControl>
                <select {...field} className="w-full border rounded-md px-2 py-1">
                  {FontFamilies.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fontWeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Font Weight</FormLabel>
              <FormControl>
                <select {...field} className="w-full border rounded-md px-2 py-1">
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                  <option value="300">300</option>
                  <option value="400">400</option>
                  <option value="500">500</option>
                  <option value="600">600</option>
                  <option value="700">700</option>
                  <option value="800">800</option>
                  <option value="900">900</option>
                </select>
              </FormControl>
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
      </form>
    </Form>
  );
}
