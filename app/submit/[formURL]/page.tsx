import { GetFormContentByURL } from "@/actions/form";
import { FormElementInstance } from "@/components/FormElements";
import FormSubmitComponent from "@/components/FormSubmitComponent";

interface Props {
  params: {
    formURL: string;
  };
}

async function SubmitPage({ params }: Props) {
  const form = await GetFormContentByURL(params.formURL);
  if (!form) throw new Error("Form not found");

  const parsed = JSON.parse(form.content);

  const formContent = parsed.elements as FormElementInstance[];
  const globalSettings = parsed.globalSettings ?? {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
  };

  return (
    <FormSubmitComponent
      formURL={params.formURL}
      formContent={formContent}
      globalSettings={globalSettings}
    />
  );
}

export default SubmitPage;
