import { Image as ImageIcon } from "lucide-react";
import * as z from "zod";
import { useEffect, useState } from "react";
import {
  ElementsType,
  FormElement,
  FormElementInstance,
  SubmitFunction,
} from "../FormElements";
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
import { Switch } from "../ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const type: ElementsType = "ImageUpload";

const extraAttributes = {
  label: "Upload Image",
  required: false,
};

const propertiesSchema = z.object({
  label: z.string().max(100),
  required: z.boolean().default(false),
});

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

type PropertiesFormSchemaType = z.infer<typeof propertiesSchema>;

export const ImageUploadFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: ImageIcon,
    label: "Image Upload",
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (formElement, value) => {
    const element = formElement as CustomInstance;
    if (element.extraAttributes.required) {
      return Boolean(value);
    }
    return true;
  },
};

function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustomInstance;
  return (
    <div className="flex flex-col gap-2">
      <Label>{element.extraAttributes.label}</Label>
      <Input type="file" disabled readOnly />
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
  const [fileUrl, setFileUrl] = useState<string | null>(defaultValue || null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const base64 = await toBase64(file); // Get base64 string
  setFileUrl(base64); // Store it in state

  const isValid = ImageUploadFormElement.validate(element, base64);
  setError(!isValid);
  if (isValid && submitValue) {
    submitValue(element.id, base64); // Save base64 instead of blob URL
  }
};

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
  return (
    <div className="flex flex-col gap-2">
      <Label className={cn(error && "text-red-500")}>
        {element.extraAttributes.label}
        {element.extraAttributes.required && "*"}
      </Label>
      <Input
        type="file"
        accept="image/*"
        className={cn(error && "border-red-500")}
        onChange={handleFileChange}
      />
      {fileUrl && (
        <img src={fileUrl} alt="Uploaded Preview" className="h-32 mt-2 rounded" />
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
    defaultValues: {
      label: element.extraAttributes.label,
      required: element.extraAttributes.required,
    },
  });

  useEffect(() => {
    form.reset(element.extraAttributes);
  }, [element, form]);

  function applyChanges(values: PropertiesFormSchemaType) {
    updateElement(element.id, {
      ...element,
      extraAttributes: values,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} onBlur={form.handleSubmit(applyChanges)}>
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>This label appears above the upload field.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="required"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded border p-3">
              <div>
                <FormLabel>Required</FormLabel>
                <FormDescription>Make this field required</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
