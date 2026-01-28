import { useEffect, useState } from "react";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";

interface Field {
  fieldKey: string;
  label: string;
  fieldType: string;
  required: boolean;
  tag: string;
}

interface ChecklistItem {
  title: string;
  assignee: "employee" | "hr";
  dueDaysAfterStart: number;
}

const CHECKLIST_FROM_FIELDS: Record<string, ChecklistItem> = {
  dateOfBirth: {
    title: "Fill personal details",
    assignee: "employee",
    dueDaysAfterStart: 1,
  },
  gender: {
    title: "Fill personal details",
    assignee: "employee",
    dueDaysAfterStart: 1,
  },
  bankName: {
    title: "Add bank and tax info",
    assignee: "employee",
    dueDaysAfterStart: 1,
  },
  tin: {
    title: "Add bank and tax info",
    assignee: "employee",
    dueDaysAfterStart: 1,
  },
  idUpload: {
    title: "Upload valid government ID",
    assignee: "employee",
    dueDaysAfterStart: 2,
  },
};

const OPTIONAL_TASKS: ChecklistItem[] = [
  {
    title: "Sign Offer Letter",
    assignee: "employee",
    dueDaysAfterStart: 2,
  },
  {
    title: "Attend onboarding call",
    assignee: "hr",
    dueDaysAfterStart: 4,
  },
];

export default function ChecklistGenerator({
  fields,
  checklist,
  setChecklist,
}: {
  fields: Field[];
  checklist: ChecklistItem[];
  setChecklist: (list: ChecklistItem[]) => void;
}) {
  const [selectedOptional, setSelectedOptional] = useState<string[]>([]);

  useEffect(() => {
    const generated: ChecklistItem[] = [];
    const seenTitles = new Set();

    fields.forEach((field) => {
      const item = CHECKLIST_FROM_FIELDS[field.fieldKey];
      if (item && !seenTitles.has(item.title)) {
        generated.push(item);
        seenTitles.add(item.title);
      }
    });

    selectedOptional.forEach((title) => {
      const opt = OPTIONAL_TASKS.find((t) => t.title === title);
      if (opt && !seenTitles.has(opt.title)) {
        generated.push(opt);
        seenTitles.add(opt.title);
      }
    });

    setChecklist(generated);
  }, [fields, selectedOptional, setChecklist]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Auto-generated Checklist</h2>

      <ul className="list-disc ml-6 text-muted-foreground">
        {checklist.map((item, idx) => (
          <li key={idx}>
            <strong>{item.title}</strong> – {item.assignee} (Due +
            {item.dueDaysAfterStart} days)
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <label className="block font-medium">Other Task:</label>
        <div className="flex flex-col gap-2">
          {OPTIONAL_TASKS.map((task) => (
            <div
              key={task.title}
              className="flex items-center space-x-2 text-md"
            >
              <Checkbox
                id={task.title}
                checked={selectedOptional.includes(task.title)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedOptional([...selectedOptional, task.title]);
                  } else {
                    setSelectedOptional(
                      selectedOptional.filter((t) => t !== task.title),
                    );
                  }
                }}
              />
              <Label htmlFor={task.title} className=" text-md font-medium">
                {task.title}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
