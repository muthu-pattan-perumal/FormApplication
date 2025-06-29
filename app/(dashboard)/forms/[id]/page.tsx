import {
  ListChecks,
  LucideView,
  MousePointerClick,
  Waypoints,
} from "lucide-react";
import { GetFormById, GetFormWithSubmissions } from "@/actions/form";
import FormLinkShare from "@/components/FormLinkShare";
import VisitBtn from "@/components/VisitBtn";
import { StatsCard } from "../../page";
import { ElementsType, FormElementInstance } from "@/components/FormElements";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  params: {
    id: string;
  };
}

async function FormDetailPage({ params }: Props) {
  const { id } = params;
  const form = await GetFormById(+id);
  if (!form) throw new Error("Form not found");

  const { submissions, visits } = form;

  const submissionRate = visits > 0 ? (submissions / visits) * 100 : 0;
  const bounceRate = 100 - submissionRate;

  return (
    <>
      <div className="border-b border-muted py-10">
        <div className="container flex justify-between">
          <h1 className="truncate text-4xl font-bold">{form.name}</h1>
          <VisitBtn shareURL={form.shareURL} />
        </div>
      </div>
      <div className="border-b border-muted py-4">
        <div className="container flex items-center justify-between gap-2">
          <FormLinkShare shareURL={form.shareURL} />
        </div>
      </div>
      <div className="container grid w-full grid-cols-1 gap-4 pt-8 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total visits"
          value={form?.visits.toLocaleString() || ""}
          icon={<LucideView className="text-blue-600" />}
          helperText="All time form visits"
          loading={false}
          className="shadow-md shadow-blue-600"
        />
        <StatsCard
          title="Total submissions"
          value={form?.submissions.toLocaleString() || ""}
          icon={<ListChecks className="text-yellow-600" />}
          helperText="All time submissions"
          loading={false}
          className="shadow-md shadow-yellow-600"
        />
        <StatsCard
          title="Submission rate"
          value={submissionRate.toLocaleString() + "%" || ""}
          icon={<MousePointerClick className="text-green-600" />}
          helperText="Visits that result in a form submission"
          loading={false}
          className="shadow-md shadow-green-600"
        />
        <StatsCard
          title="Bounce rate"
          value={bounceRate.toLocaleString() + "%" || ""}
          icon={<Waypoints className="text-red-600" />}
          helperText="Visits that leaves without interacting"
          loading={false}
          className="shadow-md shadow-red-600"
        />
      </div>

      <div className="container pt-10">
        <SubmissionsTable id={form.id} />
      </div>
    </>
  );
}

export default FormDetailPage;

type Row = { [key: string]: string } & {
  submittedAt: Date;
};

async function SubmissionsTable({ id }: { id: number }) {
  const form = await GetFormWithSubmissions(id);

  if (!form) throw new Error("Form not found");
const parsed = JSON.parse(form.content);

  const formElements = parsed.elements as FormElementInstance[];
  const globalSettings = parsed.globalSettings ?? {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
  };

  const columns: {
    id: string;
    label: string;
    required: boolean;
    type: ElementsType;
  }[] = [];

  formElements.forEach((element) => {
    switch (element.type) {
      case "TextField":
      case "NumberField":
      case "TextAreaField":
      case "DateField":
      case "SelectField":
      case "CheckboxField":
      case "ImageUpload":
        case "ChatBot":
         case "DataFiller":
      case "FileUpload":
        columns.push({
          id: element.id,
          label: element.extraAttributes?.label,
          required: element.extraAttributes?.required,
          type: element.type,
        });
        break;
      default:
        break;
    }
  });

  const rows: Row[] = form.FormSubmissions.map((submission) => ({
    ...JSON.parse(submission.content),
    submittedAt: submission.createdAt,
  }));

  return (
    <>
      <h1 className="my-4 text-2xl font-bold">Submissions</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id} className="uppercase">
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="uppercase text-muted-foreground">
                Submitted at
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((column) => (
                  <RowCell
                    key={column.id}
                    type={column.type}
                    value={row[column.id]}
                  />
                ))}
                <TableCell>
                  {formatDistance(row.submittedAt, new Date(), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function RowCell({ type, value }: { type: ElementsType; value: string }) {
  let node: React.ReactNode = value;

  switch (type) {
    case "DateField":
      if (!value) break;
      node = (
        <Badge variant="outline">{format(new Date(value), "dd/MM/yyyy")}</Badge>
      );
      break;
    case "CheckboxField":
      node = (
        <Checkbox checked={value === "true"} disabled>
          {value}
        </Checkbox>
      );
      break;

    case "ImageUpload":
      if (typeof value === "string" && value.startsWith("data:image")) {
        node = (
          <img
            src={value}
            alt="Uploaded"
            className="max-w-[100px] max-h-[100px] rounded border"
          />
        );
      } else {
        node = <span className="text-red-500 text-sm">No image</span>;
      }
      break;
case "FileUpload":
  if (typeof value === "string") {
    const fileId = value;
    node = (
      <a
        href={`/api/file/${fileId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline text-sm hover:text-blue-800"
      >
        View Uploaded File
      </a>
    );
  } else {
    node = <span className="text-red-500 text-sm">No file</span>;
  }
  break;


  }
  return <TableCell>{node}</TableCell>;
}
