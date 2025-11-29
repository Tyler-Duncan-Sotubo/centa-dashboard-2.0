import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import FormError from "@/components/ui/form-error";

const QUESTION_TYPES = ["text", "select", "radio", "checkbox"];

export function AdditionalQuestionsForm({
  questions,
  setQuestions,
  error,
}: {
  questions: {
    question: string;
    type: string;
    required: boolean;
    options: string[];
  }[];
  setQuestions: React.Dispatch<
    React.SetStateAction<
      { question: string; type: string; required: boolean; options: string[] }[]
    >
  >;
  error?: string;
}) {
  type Question = {
    question: string;
    type: string;
    required: boolean;
    options: string[];
  };

  const handleChange = (
    index: number,
    key: keyof Question,
    value: string | boolean
  ) => {
    const updated = [...questions];
    (updated[index][key] as typeof value) = value;
    setQuestions(updated);
  };

  const handleOptionChange = (
    qIndex: number,
    oIndex: number,
    value: string
  ) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const addOption = (index: number) => {
    const updated = [...questions];
    updated[index].options.push("");
    setQuestions(updated);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.splice(oIndex, 1);
    setQuestions(updated);
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", type: "text", required: false, options: [] },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  // const convertToDto = () => {
  //   return questions
  //     .filter((q) => q.question.trim())
  //     .map((q, index) => ({
  //       question: q.question.trim(),
  //       type: q.type,
  //       required: q.required ?? false,
  //       order: index,
  //       options: ["select", "radio", "checkbox"].includes(q.type)
  //         ? q.options.filter(Boolean)
  //         : undefined,
  //     }));
  // };

  return (
    <div className="space-y-4 pb-14">
      <h3 className="text-lg font-semibold">Additional Questions</h3>
      <Separator />

      {questions.map((q, index) => (
        <div key={index} className="space-y-2 border p-4 rounded-md shadow-sm">
          <div className="flex gap-2 items-center">
            <Input
              value={q.question}
              onChange={(e) => handleChange(index, "question", e.target.value)}
              placeholder={`Question ${index + 1}`}
              className="flex-1"
            />
            <Select
              value={q.type}
              onValueChange={(val) => handleChange(index, "type", val)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={q.required}
                onCheckedChange={(val) =>
                  handleChange(index, "required", val === true)
                }
              />
              <label>Required</label>
            </div>

            <Button variant="ghost" onClick={() => handleRemoveQuestion(index)}>
              Remove
            </Button>
          </div>

          {/* Options input if needed */}
          {["select", "checkbox", "radio"].includes(q.type) && (
            <div className="pl-4 space-y-2">
              {q.options.map((opt, optIndex) => (
                <div key={optIndex} className="flex gap-2 items-center">
                  <Input
                    value={opt}
                    placeholder={`Option ${optIndex + 1}`}
                    onChange={(e) =>
                      handleOptionChange(index, optIndex, e.target.value)
                    }
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    onClick={() => removeOption(index, optIndex)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addOption(index)}
              >
                + Add Option
              </Button>
            </div>
          )}
        </div>
      ))}

      <Button type="button" variant="default" onClick={handleAddQuestion}>
        + Add Question
      </Button>

      {error && <FormError message={error} />}
    </div>
  );
}
