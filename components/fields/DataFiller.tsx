// ✅ File: components/fields/DataFiller.tsx
"use client";

import { useEffect } from "react";
import { ElementsType, FormElement, FormElementInstance } from "../FormElements";
import useDesigner from "../hooks/useDesigner";

const type: ElementsType = "DataFiller";

const extraAttributes = {
  script: ``,
};

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

export const DataFillerFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: () => "📡",
    label: "Data Filler",
  },
  designerComponent: () => (
    <div className="text-sm text-muted-foreground italic">[Data filler script runs on page load]</div>
  ),
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: () => true,
};

function FormComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { elements } = useDesigner();

  useEffect(() => {
    try {
      const fillField = (id: string, value: string) => {
        const setter = (window as any)?.__fieldSetters?.[id];
        if (setter) setter(value);
      };
      const script = new Function("fillField", "elements", element.extraAttributes.script);
      script(fillField, elements);
    } catch (err) {
      console.error("Script error in DataFiller:", err);
    }
  }, []);

  return null; // Does not render anything
}

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

const schema = z.object({
  script: z.string(),
});

type PropertiesFormSchemaType = z.infer<typeof schema>;

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const { updateElement } = useDesigner();
  const element = elementInstance as CustomInstance;

  const form = useForm<PropertiesFormSchemaType>({
    resolver: zodResolver(schema),
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
      <form onSubmit={(e) => e.preventDefault()} onBlur={form.handleSubmit(applyChanges)}>
        <FormField
          control={form.control}
          name="script"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Script</FormLabel>
              <FormControl>
                <Textarea rows={10} placeholder={`fillField('some_id', 'Some value');`} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
