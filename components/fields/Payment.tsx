"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@/components/context/UserContext";
import { IndianRupee, QrCode, Smartphone, Check } from "lucide-react";
import QRCode from "react-qr-code";

import {
  FormElement,
  ElementsType,
  FormElementInstance,
  SubmitFunction,
} from "../FormElements";

import useDesigner from "../hooks/useDesigner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";

const type: ElementsType = "UPIPayment";

const defaultAttrs = {
  label: "Pay via UPI",
  required: true,
  provider: "gpay" as "gpay" | "phonepe",
  vpa: "",
  amount: "1",
  customId: "",
  size: "medium" as "small" | "medium" | "large",
  align: "left" as "left" | "center" | "right",
  authorisedUser: "",
  paid: false,
  color: "#000000",
  background: "#ffffff",
  borderRadius: "5px",
  borderColor: "#d1d5db",
  borderWidth: "1px",
};

const propertiesSchema = z.object({
  label: z.string().max(100),
  required: z.boolean(),
  provider: z.enum(["gpay", "phonepe"]),
  vpa: z.string().regex(/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/, "e.g. name@bank"),
  amount: z.string(),
  customId: z.string().optional(),
  size: z.enum(["small", "medium", "large"]),
  align: z.enum(["left", "center", "right"]),
  authorisedUser: z.string(),
  paid: z.boolean(),
  color: z.string().optional(),
  background: z.string().optional(),
  borderRadius: z.string().optional(),
  borderColor: z.string().optional(),
  borderWidth: z.string().optional(),
});

const sizeClass = { small: "col-span-3", medium: "col-span-6", large: "col-span-12" } as const;
const alignClass = { left: "justify-start", center: "justify-center", right: "justify-end" } as const;

const buildUpi = (vpa: string, amt: string) => {
  const params = new URLSearchParams({ pa: vpa, pn: "Payee", cu: "INR" });
  if (amt) params.append("am", Number(amt).toFixed(2));
  return `upi://pay?${params.toString()}`;
};

export const UPIPaymentFormElement: FormElement = {
  type,
  construct: (id: string) => ({ id, type, extraAttributes: defaultAttrs }),
  designerBtnElement: { icon: IndianRupee, label: "UPI Payment" },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: () => true,
};

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const el = elementInstance as CustomInstance;
  return (
    <div className={cn("flex flex-col gap-2", sizeClass[el.extraAttributes.size])}>
      <Label>{el.extraAttributes.label}</Label>
      <div className="flex items-center gap-3 border rounded p-3 text-muted-foreground">
        <Smartphone size={18} />
        <span>UPI payment field (preview)</span>
      </div>
    </div>
  );
}

function FormComponent({
  elementInstance, submitValue, isInvalid, currentUser,defaultValue,
}: {
  elementInstance: FormElementInstance;
  submitValue?: SubmitFunction;
  isInvalid?: boolean;
  currentUser?: any;
  defaultValue?: string;
}) {
  const user = useUser();
  const el = elementInstance as CustomInstance;
  const { customId, vpa, size, align } = el.extraAttributes;
  const uniqueId = customId || `amount-${el.id}`;
  const authorised = user && user?.email === el.extraAttributes.authorisedUser;

  // 👇 Parse any existing value from storage
  const parsedInitialValue = (() => {
    try {
      if (typeof defaultValue === "string") return JSON.parse(defaultValue);
    } catch { }
    return null;
  })();

  const [amount, setAmount] = useState(parsedInitialValue?.amount ?? el.extraAttributes.amount);
  const [paid, setPaid] = useState(parsedInitialValue?.paid ?? el.extraAttributes.paid);
  const [open, setOpen] = useState(false);

  const updateValue = useCallback((newAmt: string, newPaid = paid) => {
    if (submitValue) {
      submitValue(el.id, JSON.stringify({
        amount: newAmt,
        provider: el.extraAttributes.provider,
        paid: newPaid,
        upiString: buildUpi(vpa, newAmt),
      }));
    }
  }, [submitValue, el.id, el.extraAttributes.provider, paid, vpa]);

  const externalHandler = useCallback((e: Event) => {
    const { id, amount: amt } = (e as CustomEvent<{ id: string; amount: string }>).detail;
    if (id === uniqueId) {
      setAmount(amt);
      updateValue(amt);
    }
  }, [uniqueId, updateValue]);

  useEffect(() => {
    window.addEventListener("upi-set-amount", externalHandler);
    return () => window.removeEventListener("upi-set-amount", externalHandler);
  }, [externalHandler]);

  useEffect(() => {
    if (typeof window.setUPIAmount !== "function") {
      window.setUPIAmount = (id, amt) =>
        window.dispatchEvent(new CustomEvent("upi-set-amount", { detail: { id, amount: amt } }));
    }
  }, []);

  const style: React.CSSProperties = {
    color: el.extraAttributes.color,
    background: el.extraAttributes.background,
    borderRadius: el.extraAttributes.borderRadius,
  };

  return (
    <div className={cn("flex flex-col gap-2", sizeClass[size], alignClass[align])} style={style}>
      <Label className={cn(isInvalid && "text-red-500")}>
        {el.extraAttributes.label} {el.extraAttributes.required && "*"}
      </Label>
      <div className="flex items-center gap-2 mt-2">
        <Input
          id={uniqueId}
          name={uniqueId}
          value={amount}
          disabled
          className="w-24 text-center"
          style={{
            width: "90%",
            border: `${el.extraAttributes.borderWidth} solid ${el.extraAttributes.borderColor}`,
          }}
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" style={{ width: "7rem" }}>
              {paid ? "View" : "QR"} <QrCode size={18} className="ml-2" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>UPI Payment</DialogTitle></DialogHeader>
            {paid ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <Check size={64} className="text-green-600" />
                <p className="font-medium text-green-700">Payment received</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-4">
                <QRCode value={buildUpi(vpa, amount)} size={200} />
                <p className="text-sm text-muted-foreground">Scan with {el.extraAttributes.provider}</p>
              </div>
            )}
            {authorised && !paid && (
              <Button onClick={() => {
                setPaid(true);
                setOpen(false);
                updateValue(amount, true);
              }}>
                Mark as paid
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
type Attrs = typeof defaultAttrs;
type CustomInstance = FormElementInstance & {
  value?: string; // ✅ add this line
  extraAttributes: Attrs;
};
type PropertiesForm = z.infer<typeof propertiesSchema>;

/* ────────────── Properties Editor ────────────── */
function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const { updateElement } = useDesigner();
  const el = elementInstance as CustomInstance;

  const form = useForm<PropertiesForm>({
    resolver: zodResolver(propertiesSchema),
    mode: "onBlur",
    defaultValues: el.extraAttributes,
  });

  useEffect(() => form.reset(el.extraAttributes), [el, form]);
  const apply = (v: PropertiesForm) => updateElement(el.id, { ...el, extraAttributes: v });

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} onBlur={form.handleSubmit(apply)}>
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl><Input {...field} /></FormControl>
            </FormItem>
          )}
        />
        {/* (all other existing settings left unchanged for brevity) */}

        <FormField
          control={form.control}
          name="required"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded border p-3">
              <div>
                <FormLabel>Required</FormLabel>
                <FormDescription>User must pay before submit</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* layout */}
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Width</FormLabel>
                <FormControl>
                  <select {...field} className="w-full border rounded px-2 py-1">
                    <option value="small">col‑3</option>
                    <option value="medium">col‑6</option>
                    <option value="large">col‑12</option>
                  </select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="align"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Align</FormLabel>
                <FormControl>
                  <select {...field} className="w-full border rounded px-2 py-1">
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* provider / vpa / amount / authorisedUser */}
        <FormField
          control={form.control}
          name="provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provider icon</FormLabel>
              <FormControl>
                <select {...field} className="w-full border rounded px-2 py-1">
                  <option value="gpay">Google Pay</option>
                  <option value="phonepe">PhonePe</option>
                </select>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vpa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>UPI ID (VPA)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="name@bank" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (INR)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="authorisedUser"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User who can mark paid</FormLabel>
              <FormControl>
                <Input {...field} placeholder="username / email" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* colours */}
        {(["color", "background", "borderColor"] as const).map((name) => (
          <FormField<PropertiesForm, typeof name>
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="capitalize">
                  {name === "color"
                    ? "Text Color"
                    : name === "background"
                      ? "Background"
                      : "Border Color"}
                </FormLabel>
                <FormControl>
                  <Input type="color" {...field} value={field.value ?? "#000000"} />
                </FormControl>
              </FormItem>
            )}
          />
        ))}

        <FormField
          control={form.control}
          name="borderWidth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Border width</FormLabel>
              <FormControl>
                <Input placeholder="1px" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="borderRadius"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Border radius</FormLabel>
              <FormControl>
                <Input placeholder="5px" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
      <FormField
        control={form.control}
        name="customId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Custom input ID / name</FormLabel>
            <FormControl><Input {...field} placeholder="e.g. perumalUpi" /></FormControl>
            <FormDescription>
              Use from JS: <code>window.setUPIAmount(perumalUpi, 10)</code>
            </FormDescription>
          </FormItem>
        )}
      />
    </Form>
  );
}
/* ────────────── Global Helper Type ────────────── */
declare global {
  interface Window {
    setUPIAmount?: (id: string, amount: string) => void;
  }
}
