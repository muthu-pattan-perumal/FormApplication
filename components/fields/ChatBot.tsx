// ChatBotFormElement.tsx
"use client";

import { useEffect, useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
    ElementsType,
    FormElement,
    FormElementInstance,
} from "../FormElements";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import useDesigner from "../hooks/useDesigner";
import { cn } from "@/lib/utils";

const type: ElementsType = "ChatBot";

const extraAttributes = {
    label: "Open ChatBot",
    size: "medium" as "small" | "medium" | "large",
    openByDefault: false,
    groqApiKey: "",
    borderRadius: "12px",
    chatBoxHeight: "400px",
    backgroundColor: "#f9fafb",
    textColor: "#111827",
    userBubbleColor: "#dbeafe",
    userTextColor: "#1e3a8a",
    botBubbleColor: "#e0f2fe",
    botTextColor: "#075985",
    heading: "ChatBot",
    description: "Chat interface connected to Groq API",
    buttonBackgroundColor: "#2563eb",
    buttonTextColor: "#ffffff",
    buttonBorderRadius: "8px",
    buttonHeight: "48px",
    buttonWidth: "fit-content",
    buttonAlign: "center" as "left" | "center" | "right",
};

const propertiesSchema = z.object({
    label: z.string(),
    size: z.enum(["small", "medium", "large"]),
    openByDefault: z.boolean(),
    groqApiKey: z.string(),
    borderRadius: z.string(),
    chatBoxHeight: z.string(),
    backgroundColor: z.string(),
    textColor: z.string(),
    userBubbleColor: z.string(),
    userTextColor: z.string(),
    botBubbleColor: z.string(),
    botTextColor: z.string(),
    heading: z.string(),
    description: z.string(),
    buttonBackgroundColor: z.string(),
    buttonTextColor: z.string(),
    buttonBorderRadius: z.string(),
    buttonHeight: z.string(),
    buttonWidth: z.string(),
    buttonAlign: z.enum(["left", "center", "right"]),
});

type PropertiesFormSchemaType = z.infer<typeof propertiesSchema>;

type CustomInstance = FormElementInstance & {
    extraAttributes: typeof extraAttributes;
};

export const ChatBotFormElement: FormElement = {
    type,
    construct: (id: string) => ({
        id,
        type,
        extraAttributes,
    }),
    designerBtnElement: {
        icon: () => "💬",
        label: "ChatBot",
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
    }[size];
}

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
    const element = elementInstance as CustomInstance;
    return (
        <div className={cn(getSizeClass(element.extraAttributes.size))}>
            <Button disabled>{element.extraAttributes.label}</Button>
        </div>
    );
}

function FormComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
    const element = elementInstance as CustomInstance;
    const [open, setOpen] = useState(element.extraAttributes.openByDefault);
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState("");

    const callGPT = async (message: string) => {
        const key = element.extraAttributes.groqApiKey;
        if (!key) {
            alert("API key is missing!");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${key}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama3-70b-8192",
                    messages: [
                        { role: "user", content: message },
                    ],
                }),
            });

            const data = await response.json();
            const reply = data?.choices?.[0]?.message?.content || "No response";
            setMessages((prev) => [...prev, `User: ${message}`, `Bot: ${reply}`]);
            setInput("");
        } catch (err) {
            setMessages((prev) => [...prev, "Bot: Error fetching response"]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn(getSizeClass(element.extraAttributes.size), {
            "text-left": element.extraAttributes.buttonAlign === "left",
            "text-center": element.extraAttributes.buttonAlign === "center",
            "text-right": element.extraAttributes.buttonAlign === "right",
        })}>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        style={{
                            backgroundColor: element.extraAttributes.buttonBackgroundColor,
                            color: element.extraAttributes.buttonTextColor,
                            borderRadius: element.extraAttributes.buttonBorderRadius,
                            height: element.extraAttributes.buttonHeight,
                            width: element.extraAttributes.buttonWidth,
                        }}
                    >
                        {element.extraAttributes.label}
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg w-full p-0 overflow-hidden" style={{ borderRadius: element.extraAttributes.borderRadius }}>
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle>{element.extraAttributes.heading}</DialogTitle>
                        <DialogDescription>{element.extraAttributes.description}</DialogDescription>
                    </DialogHeader>

                    <div
                        className="flex flex-col h-[80vh]"
                        style={{
                            backgroundColor: element.extraAttributes.backgroundColor,
                            color: element.extraAttributes.textColor,
                        }}>
                        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
                            {messages.map((msg, idx) => {
                                const isUser = msg.startsWith("User:");
                                const borderRadius = isUser
                                    ? "12px 12px 0px 12px"
                                    : "12px 12px 12px 0px";
                                return (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "p-2 max-w-xs",
                                            isUser ? "ml-auto" : "mr-auto"
                                        )}
                                        style={{
                                            backgroundColor: isUser
                                                ? element.extraAttributes.userBubbleColor
                                                : element.extraAttributes.botBubbleColor,
                                            color: isUser
                                                ? element.extraAttributes.userTextColor
                                                : element.extraAttributes.botTextColor,
                                            borderRadius,
                                            width: "max-content",
                                        }}>
                                        {msg.replace(/^User: |^Bot: /, "")}
                                    </div>
                                );
                            })}
                        </div>

                        <DialogFooter className="flex items-center gap-2 border-t p-4">
                            <Input
                                className="flex-1"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                            />
                            <Button onClick={() => callGPT(input)} disabled={loading || !input.trim()}>
                                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Send"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
    const { updateElement } = useDesigner();
    const element = elementInstance as CustomInstance;

    const form = useForm<PropertiesFormSchemaType>({
        resolver: zodResolver(propertiesSchema),
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
            <form
                onSubmit={(e) => e.preventDefault()}
                onBlur={form.handleSubmit(applyChanges)}
                className="space-y-4"
            >
                {Object.entries(propertiesSchema.shape).map(([name]) => (
                    <FormField
                        key={name}
                        control={form.control}
                        name={name as keyof PropertiesFormSchemaType}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="capitalize">{name.replace(/([A-Z])/g, " $1")}</FormLabel>
                                <FormControl>
                                    {name === "openByDefault" ? (
                                        <input
                                            type="checkbox"
                                            checked={field.value as boolean}
                                            onChange={(e) => field.onChange(e.target.checked)}
                                            onBlur={field.onBlur}
                                            name={field.name}
                                            ref={field.ref}
                                        />
                                    ) : name.includes("Color") ? (
                                        <input
                                            type="color"
                                            value={field.value as string}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            onBlur={field.onBlur}
                                            name={field.name}
                                            ref={field.ref}
                                        />
                                    ) : (
                                        <Input {...(field as any)} />
                                    )}
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ))}
            </form>
        </Form>
    );
}
