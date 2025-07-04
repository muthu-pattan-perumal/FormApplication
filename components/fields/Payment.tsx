"use client";
/* ────────────────────────────────────────────────────────────────
   UPI‑Payment element  v3 – external amount setter + customId
   call from console:  window.setUPIAmount("perumalUpi","10");
   ──────────────────────────────────────────────────────────────── */
import { IndianRupee, Check, QrCode, Smartphone } from "lucide-react";
import { FaGooglePay, FaPhoneAlt } from "react-icons/fa";
import QRCode from "react-qr-code";
import { useState, useEffect, useCallback } from "react";
import * as z from "zod";
import {
  ElementsType,
  FormElement,
  FormElementInstance,
  SubmitFunction,
} from "../FormElements";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";
import useDesigner from "../hooks/useDesigner";
import {
  Form, FormControl, FormDescription, FormField, FormItem,
  FormLabel, FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

/* ───────── meta & defaults ───────── */
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

/* ───────── schema ───────── */
const vpaRegex = /^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/;
const propertiesSchema = z.object({
  label: z.string().max(100),
  required: z.boolean().default(false),
  provider: z.enum(["gpay", "phonepe"]).default("gpay"),
  vpa: z.string().regex(vpaRegex, "Enter full UPI ID (e.g. name@bank)"),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "0‑2 decimals"),
  customId: z.string().max(100).optional(),
  size: z.enum(["small", "medium", "large"]).default("medium"),
  align: z.enum(["left", "center", "right"]).default("left"),
  authorisedUser: z.string().max(100),
  paid: z.boolean().default(false),
  color: z.string().optional(),
  background: z.string().optional(),
  borderRadius: z.string().optional(),
  borderColor: z.string().optional(),
  borderWidth: z.string().optional(),
});
type Attrs = typeof defaultAttrs;
type CustomInstance = FormElementInstance & { extraAttributes: Attrs };
type PropertiesForm = z.infer<typeof propertiesSchema>;

const sizeClass = { small: "col-span-3", medium: "col-span-6", large: "col-span-12" } as const;
const alignClass = { left: "justify-start", center: "justify-center", right: "justify-end" } as const;

/* ───────── helpers ───────── */
const buildUpi = (vpa: string, amt: string) => {
  const p = new URLSearchParams({ pa: vpa.toLowerCase(), pn: "Payee", cu: "INR" });
  if (amt) p.append("am", Number(amt).toFixed(2));
  return `upi://pay?${p.toString()}`;
};

/* ───────── element export ───────── */
export const UPIPaymentFormElement: FormElement = {
  type,
  construct: (id: string) => ({ id, type, extraAttributes: defaultAttrs }),
  designerBtnElement: { icon: IndianRupee, label: "UPI Payment" },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (fe, val) => {
    const el = fe as CustomInstance;
    if (!el.extraAttributes.required) return true;
    try {
      const v = typeof val === "string" ? JSON.parse(val) : val;
      return v?.paid === true;
    } catch {
      return false;
    }
  },
};

/* ───────── designer preview ───────── */
function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
    const { label, size } = (elementInstance as CustomInstance).extraAttributes;
    return (
        <div className={cn("flex flex-col gap-2", sizeClass[size])}>
            <Label>{label}</Label>
            <div className="flex items-center gap-3 border rounded p-3 text-muted-foreground">
                <Smartphone size={18} />
                <span>UPI payment field (preview)</span>
            </div>
        </div>
    );
}
/* ───────── runtime component ───────── */
function FormComponent({
  elementInstance, submitValue, isInvalid, currentUser,
}: {
  elementInstance: FormElementInstance;
  submitValue?: SubmitFunction;
  isInvalid?: boolean;
  currentUser?: string;
}) {
  const el = elementInstance as CustomInstance;
  const {
    label, required, provider, vpa,
    size, align, authorisedUser, customId,
  } = el.extraAttributes;

  /* amount & paid in local state */
  const [amount, setAmount] = useState(el.extraAttributes.amount);
  const [paid, setPaid] = useState(el.extraAttributes.paid);
  const [open, setOpen] = useState(false);

  /* propagate to parent */
  useEffect(() => {
    submitValue?.(
      el.id,
      JSON.stringify({ amount, provider, paid, upiString: buildUpi(vpa, amount) })
    );
  }, [amount, paid, submitValue, el.id, provider, vpa]);

  /* listen for external setUPIAmount */
  const externalHandler = useCallback(
    (e: Event) => {
      const { id, amount: amt } = (e as CustomEvent<{ id: string; amount: string }>).detail;
      if (id === (customId || `amount-${el.id}`)) setAmount(amt);
    },
    [customId, el.id]
  );
  useEffect(() => {
    window.addEventListener("upi-set-amount", externalHandler);
    return () => window.removeEventListener("upi-set-amount", externalHandler);
  }, [externalHandler]);

  /* register global helper once */
  useEffect(() => {
    if (typeof window.setUPIAmount !== "function") {
      window.setUPIAmount = (id: string, amt: string) =>
        window.dispatchEvent(new CustomEvent("upi-set-amount", { detail: { id, amount: amt } }));
    }
  }, []);

  const authorised = currentUser && currentUser === authorisedUser;
  const style: React.CSSProperties = {
    color: el.extraAttributes.color,
    background: el.extraAttributes.background,
    borderRadius: el.extraAttributes.borderRadius,
    // borderColor: el.extraAttributes.borderColor,
    // borderWidth: el.extraAttributes.borderWidth,
  };

  return (
    <div className={cn("flex flex-col gap-2", sizeClass[size], alignClass[align])} style={{ ...style,  }}
>
      <Label className={cn(isInvalid && "text-red-500")}>
        {label} {required && "*"}
      </Label>

      <div className="flex items-center gap-2 mt-2">
        <Input
          id={customId || `amount-${el.id}`}
          name={customId || `amount-${el.id}`}
          value={amount}
          disabled
          className="w-24 text-center cursor-default select-none"
          style={{width:"90%"}}
        />

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" style={{width:"7rem"}}>
              {paid ? "View status" : "Generate QR"} <QrCode size={18} className="ml-2" />
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
                <p className="text-sm text-muted-foreground">
                  Scan with {provider === "gpay" ? "Google Pay" : "PhonePe"}
                </p>
              </div>
            )}

            {authorised && !paid && (
              <Button onClick={() => { setPaid(true); setOpen(false); }}>
                Mark as paid
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

/* ───────── property pane ───────── */
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

/* ───── Type for global helper ───── */
declare global {
  interface Window {
    setUPIAmount?: (id: string, amount: string) => void;
  }
}
