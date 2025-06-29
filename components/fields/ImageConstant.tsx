// components/fields/ImageConstant.tsx
"use client";

import { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import ImageEditorModal from "../ImageEditorModal";
import { Image as ImageIcon } from "lucide-react";
import {
  ElementsType,
  FormElement,
  FormElementInstance,
} from "../FormElements";

const type: ElementsType = "ImageConstant";

const extraAttributes = {
  imageUrl: "",
  width: "100%",
  height: "200px",
  borderRadius: "0px",
  size: "medium" as "small" | "medium" | "large",
};

const propertiesSchema = z.object({
  imageUrl: z.string().or(z.literal("")),
  width: z.string(),
  height: z.string(),
  borderRadius: z.string(),
  size: z.enum(["small", "medium", "large"]).default("medium"),
});

type PropertiesFormSchemaType = z.infer<typeof propertiesSchema>;

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

export const ImageConstantFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: ImageIcon,
    label: "Static Image",
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
  }[size] || "col-span-6";
}

function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { imageUrl, width, height, borderRadius, size } =
    element.extraAttributes;

  return (
    <div className={cn("flex flex-col gap-2", getSizeClass(size))}>
      <Label>Static Image Preview</Label>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Static Preview"
          style={{ width, height, borderRadius, objectFit: "cover" }}
          className="object-cover bg-muted"
        />
      ) : (
        <div className="w-full h-[150px] bg-muted flex items-center justify-center text-muted-foreground border rounded">
          No Image URL
        </div>
      )}
    </div>
  );
}

function FormComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  const { imageUrl, width, height, borderRadius, size } =
    element.extraAttributes;

  return (
    <div className={cn("flex flex-col gap-2", getSizeClass(size))}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Static"
          style={{ width, height, borderRadius, objectFit: "cover" }}
          className="object-cover"
        />
      ) : (
        <div className="w-full h-[150px] bg-muted flex items-center justify-center text-muted-foreground border rounded">
          No image to display
        </div>
      )}
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

  const applyChanges = (values: PropertiesFormSchemaType) => {
    updateElement(element.id, {
      ...element,
      extraAttributes: values,
    });
  };

  const [imageToEdit, setImageToEdit] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImageToEdit(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={(e) => e.preventDefault()}
          onBlur={form.handleSubmit(applyChanges)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  You can paste an external URL or upload an image below.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <FormLabel>Upload Image</FormLabel>
            <Input type="file" accept="image/*" onChange={handleFileUpload} />
            <FormDescription>This will override the URL above.</FormDescription>
          </div>
          <FormField
            control={form.control}
            name="width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Width</FormLabel>
                <FormControl>
                  <Input placeholder="100%" {...field} />
                </FormControl>
                <FormDescription>CSS width (e.g., 100%, 300px)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height</FormLabel>
                <FormControl>
                  <Input placeholder="200px" {...field} />
                </FormControl>
                <FormDescription>
                  CSS height (e.g., 200px)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="borderRadius"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Border Radius</FormLabel>
                <FormControl>
                  <Input placeholder="8px" {...field} />
                </FormControl>
                <FormDescription>
                  CSS border-radius (e.g., 8px or 50%)
                </FormDescription>
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
                    {...field}
                    className="w-full border rounded-md px-2 py-1 bg-background text-foreground"
                  >
                    <option value="small">Small (col-span-3)</option>
                    <option value="medium">Medium (col-span-6)</option>
                    <option value="large">Large (col-span-12)</option>
                  </select>
                </FormControl>
                <FormDescription>Width in the form layout</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {imageToEdit && (
        <ImageEditorModal
          open={true}
          image={imageToEdit}
          onClose={() => setImageToEdit(null)}
          onSave={(editedBase64) => {
            form.setValue("imageUrl", editedBase64);
            applyChanges({
              ...form.getValues(),
              imageUrl: editedBase64,
            });
            setImageToEdit(null);
          }}
        />
      )}
    </>
  );
}