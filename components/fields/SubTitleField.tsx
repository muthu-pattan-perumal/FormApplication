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
import { cn } from "@/lib/utils"; // ✅ utility for className conditionals

// ✅ Element setup
const type: ElementsType = "SubTitleField";
const extraAttributes = {
  title: "SubTitle field",
  size: "medium" as "small" | "medium" | "large",
};

// ✅ Schema with size
const propertiesSchema = z.object({
  title: z.string().min(2).max(100),
  size: z.enum(["small", "medium", "large"]).default("medium"),
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

// ✅ Size helper
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

// ✅ DesignerComponent
function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { title, size } = element.extraAttributes;

  return (
    <div className={cn("flex flex-col gap-2", getSizeClass(size))}>
      <Label className="text-muted-foreground">SubTitle field</Label>
      <p className="text-lg">{title}</p>
    </div>
  );
}

// ✅ FormComponent
function FormComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { title, size } = element.extraAttributes;

  return <p className={cn("text-lg", getSizeClass(size))}>{title}</p>;
}

// ✅ PropertiesComponent
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
      title: element.extraAttributes.title,
      size: element.extraAttributes.size || "medium",
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={field.name}>Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ✅ Size selector */}
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
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
