import { Heading1 } from "lucide-react";
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

// ✅ Step 1: Define size type and use it
type SizeType = "small" | "medium" | "large";

// ✅ Step 2: Add size to extraAttributes
const type: ElementsType = "TitleField";
const extraAttributes = {
  title: "Title field",
  size: "medium" as SizeType,
};

// ✅ Step 3: Update schema to include size
const propertiesSchema = z.object({
  title: z.string().min(2).max(100),
  size: z.enum(["small", "medium", "large"]),
});

export const TitleFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: Heading1,
    label: "Title field",
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: () => true,
};

// ✅ Step 4: Update CustomInstance type
type CustomInstance = FormElementInstance & {
  extraAttributes: {
    title: string;
    size: SizeType;
  };
};

type PropertiesFormSchemaType = z.infer<typeof propertiesSchema>;

// ✅ Step 5: Map size to Tailwind class
function getSizeClass(size: SizeType) {
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

// 🔧 DesignerComponent with layout
function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { title, size } = element.extraAttributes;

  return (
    <div className={`flex w-full flex-col gap-2 ${getSizeClass(size)}`}>
      <Label className="text-muted-foreground">Title field</Label>
      <p className="text-xl">{title}</p>
    </div>
  );
}

// 🔧 FormComponent with layout
function FormComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { title, size } = element.extraAttributes;

  return <p className={`text-xl ${getSizeClass(size)}`}>{title}</p>;
}

// 🔧 PropertiesComponent with title + size input
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
    const { title, size } = values;
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        title,
        size,
      },
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => e.preventDefault()}
        onBlur={form.handleSubmit(applyChanges)}
      >
        {/* ✅ Title input */}
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
              <FormLabel htmlFor={field.name}>Size</FormLabel>
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
