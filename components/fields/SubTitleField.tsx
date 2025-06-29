import { Heading2 } from "lucide-react";
import * as z from "zod";
import {
  ElementsType,
  FormElement,
  FormElementInstance,
} from "../FormElements";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
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
import { cn } from "@/lib/utils";

const type: ElementsType = "SubTitleField";
const FontFamilies = ["Arial", "Times New Roman", "Courier New", "Verdana"];
const extraAttributes = {
  title: "SubTitle field",
  size: "medium" as "small" | "medium" | "large",
  marginTop: "0px",
  marginBottom: "0px",
  marginLeft: "0px",
  marginRight: "0px",
  showColumn: true,
  fontSize: "16px",
  fontFamily: "Arial",
  fontWeight: "normal",
  color: "#000000",
};

const propertiesSchema = z.object({
  title: z.string().min(2).max(100),
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

export const SubTitleFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: Heading2,
    label: "SubTitle field",
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
    case "small": return "col-span-3";
    case "medium": return "col-span-6";
    case "large": return "col-span-12";
    default: return "col-span-6";
  }
}

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { title, size, showColumn, marginTop, marginBottom, marginLeft, marginRight, fontSize, fontFamily, fontWeight, color } = element.extraAttributes;
  if (!showColumn) return null;
  const style = { marginTop, marginBottom, marginLeft, marginRight, fontSize, fontFamily, fontWeight, color } as React.CSSProperties;

  return (
    <div className={cn("flex flex-col gap-2", getSizeClass(size))} style={style}>
      <Label className="text-muted-foreground">SubTitle field</Label>
      <p>{title}</p>
    </div>
  );
}

function FormComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { title, size, showColumn, marginTop, marginBottom, marginLeft, marginRight, fontSize, fontFamily, fontWeight, color } = element.extraAttributes;
  if (!showColumn) return null;
  const style = { marginTop, marginBottom, marginLeft, marginRight, fontSize, fontFamily, fontWeight, color } as React.CSSProperties;

  return <p className={cn(getSizeClass(size))} style={style}>{title}</p>;
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
  }, [element, form]);

  const applyChanges = (values: PropertiesFormSchemaType) => {
    updateElement(element.id, { ...element, extraAttributes: values });
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} onBlur={form.handleSubmit(applyChanges)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="size" render={({ field }) => (
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
        )} />

        <FormField control={form.control} name="showColumn" render={({ field }) => (
          <FormItem>
            <FormLabel>Show Column</FormLabel>
            <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

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

        <FormField control={form.control} name="fontSize" render={({ field }) => (
          <FormItem>
            <FormLabel>Font Size (e.g. 18px)</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="fontFamily" render={({ field }) => (
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
        )} />

        <FormField control={form.control} name="fontWeight" render={({ field }) => (
          <FormItem>
            <FormLabel>Font Weight</FormLabel>
            <FormControl>
              <select {...field} className="w-full border rounded-md px-2 py-1">
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                {["100", "200", "300", "400", "500", "600", "700", "800", "900"].map(weight => (
                  <option key={weight} value={weight}>{weight}</option>
                ))}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="color" render={({ field }) => (
          <FormItem>
            <FormLabel>Text Color</FormLabel>
            <FormControl><Input type="color" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </form>
    </Form>
  );
}