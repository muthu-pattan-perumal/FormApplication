"use client";

import { useEffect } from "react";
import { ElementsType, FormElement, FormElementInstance } from "../FormElements";
import useDesigner from "../hooks/useDesigner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../../components/ui/form";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";

const type: ElementsType = "DataWatcher";

const extraAttributes = {
  watchFieldId: "",
  script: ``,
  size: "medium",
};

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

const schema = z.object({
  watchFieldId: z.string().min(1, "Field ID is required"),
  script: z.string(),
  size: z.enum(["small", "medium", "large"]), // better for type safety
});


type PropertiesFormSchemaType = z.infer<typeof schema>;

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const { updateElement } = useDesigner();
  const element = elementInstance as CustomInstance;

  const form = useForm<PropertiesFormSchemaType>({
    resolver: zodResolver(schema),
    defaultValues: element.extraAttributes as PropertiesFormSchemaType,
  });


  useEffect(() => {
    const safeExtraAttributes: PropertiesFormSchemaType = {
      ...element.extraAttributes,
      size: ["small", "medium", "large"].includes(element.extraAttributes.size)
        ? element.extraAttributes.size
        : "medium", // fallback to safe value
    } as PropertiesFormSchemaType;

    form.reset(safeExtraAttributes);
  }, [element]);


  const applyChanges = (values: PropertiesFormSchemaType) => {
    updateElement(element.id, {
      ...element,
      extraAttributes: values,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} onBlur={form.handleSubmit(applyChanges)}>
        <FormField
          control={form.control}
          name="watchFieldId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Watch Field ID</FormLabel>
              <FormControl>
                <Input placeholder="e.g. textfield_1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="script"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Script (on value change)</FormLabel>
              <FormControl>
                <Textarea rows={10} placeholder={`console.log('Changed:', newValue);`} {...field} />
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
                <select {...field} className="input">
                  <option value="small">Small (1/3)</option>
                  <option value="medium">Medium (2/3)</option>
                  <option value="large">Large (full)</option>
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

function FormComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { elements } = useDesigner();

  useEffect(() => {
    const targetId = element.extraAttributes.watchFieldId;
    if (!targetId) return;

    const setterKey = `__fieldWatchers__${targetId}`;

    const onChange = (newValue: string) => {
      try {
        const script = new Function("newValue", "elements", element.extraAttributes.script);
        script(newValue, elements);
      } catch (err) {
        console.error("Script error in DataWatcher:", err);
      }
    };

    (window as any)[setterKey] = onChange;

    return () => {
      delete (window as any)[setterKey];
    };
  }, [element.extraAttributes.watchFieldId, element.extraAttributes.script]);

  return null;
}

export const DataWatcherFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: () => "🛰️",
    label: "Data Watcher",
  },

  designerComponent: ({ elementInstance }) => {
    const sizeClassMap = {
      small: "col-span-1",
      medium: "col-span-2",
      large: "col-span-3",
    } as const;

    const element = elementInstance as CustomInstance;

    // Ensure the size is one of the known keys, or fallback to 'small'
    const validSizes = ["small", "medium", "large"] as const;
    const size = validSizes.includes(element.extraAttributes.size as any)
      ? (element.extraAttributes.size as keyof typeof sizeClassMap)
      : "small";

    const sizeClass = sizeClassMap[size];

    return (
      <div className={`text-sm text-muted-foreground italic ${sizeClass}`}>
        [Runs script on field value change]
      </div>
    );
  },

  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: () => true,
};
