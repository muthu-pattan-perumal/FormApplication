import { File as FileIcon } from "lucide-react";
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

const type: ElementsType = "FileUpload";

const extraAttributes = {
  label: "Upload File",
  required: false,
  size: "medium" as "small" | "medium" | "large",
  color: "#000000",
  background: "white",
  borderRadius: "5px",
  borderColor: "gray",
  borderWidth: "1px",
};

const propertiesSchema = z.object({
  label: z.string().max(100),
  required: z.boolean().default(false),
  size: z.enum(["small", "medium", "large"]).default("medium"),
  color: z.string().optional(),
  background: z.string().optional(),
  borderRadius: z.string().optional(),
  borderColor: z.string().optional(),
  borderWidth: z.string().optional(),

});

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

type PropertiesFormSchemaType = z.infer<typeof propertiesSchema>;

export const FileUploadFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: FileIcon,
    label: "File Upload",
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
    <div className="flex flex-col gap-2">
      <Label style={{ color: element.extraAttributes.color }}>{element.extraAttributes.label}</Label>
      <Input type="file" disabled readOnly style={{ ...style }} />
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
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileLink, setFileLink] = useState<string | null>(defaultValue || null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        const fileUrl = `/api/file/${data.fileId}`;
        setFileLink(fileUrl);

        const isValid = FileUploadFormElement.validate(element, data.fileId);
        setError(!isValid);

        if (isValid && submitValue) {
          submitValue(element.id, String(data.fileId));
        }
      } else {
        setError(true);
        console.error("Upload error:", data.error || data.details);
      }
    } catch (error) {
      setError(true);
      console.error("Upload failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClass = {
    small: "col-span-3",
    medium: "col-span-6",
    large: "col-span-12",
  }[element.extraAttributes.size || "medium"];
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
    <div className={cn("flex flex-col gap-2 relative", sizeClass)}>
      <Label className={cn(error && "text-red-500")} style={{ color: element.extraAttributes.color }}>{element.extraAttributes.label}{element.extraAttributes.required && "*"}</Label>
      <div className="relative">
        <Input
          type="file"
          accept=".pdf,.doc,.docx,.xml,.json,.csv,.txt"
          className={cn(error && "border-red-500", loading && "opacity-50 cursor-not-allowed")}
          onChange={handleFileChange}
          disabled={loading}
          style={{ ...style }}
        />
        {loading && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </div>
        )}
      </div>
      {fileName && <p className="text-sm mt-1 text-gray-600 truncate">📄 {fileName}</p>}
      {fileLink && (
        <a href={fileLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm underline hover:text-blue-800">
          View Uploaded File
        </a>
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
        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Size</FormLabel>
              <FormControl>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value as "small" | "medium" | "large")}
                >
                  <option value="small">Small (1 column)</option>
                  <option value="medium">Medium (2 columns)</option>
                  <option value="large">Large (3 columns)</option>
                </select>
              </FormControl>
              <FormDescription>Width of this field in the form grid</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
