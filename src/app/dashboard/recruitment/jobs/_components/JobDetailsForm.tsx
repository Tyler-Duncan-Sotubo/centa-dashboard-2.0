/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmploymentType, JobType } from "@/types/enums";
import React from "react";
import { PipelineTemplateSelector } from "./pipeline-template-selector";
import { Textarea } from "@/components/ui/textarea";
import { formatSource } from "@/utils/formatSource";
import { CentaAISuggest } from "@/components/ui/centa-ai-suggest";
import { DateInput } from "@/components/ui/date-input";
import { Controller } from "react-hook-form";

const currencies = [
  { label: "🇺🇸 USD", value: "USD" },
  { label: "🇪🇺 EUR", value: "EUR" },
  { label: "🇬🇧 GBP", value: "GBP" },
  { label: "🇳🇬 NGN", value: "NGN" },
  { label: "🇮🇳 INR", value: "INR" },
  { label: "🇨🇦 CAD", value: "CAD" },
];

const JobDetailsForm = ({
  form,
  control,
  isLoading,
  setIsLoading,
  templates,
  resFields,
  addRes,
  removeRes,
  addReq,
  removeReq,
  reqFields,
  register,
  benefitsFields,
  addBenefit,
  removeBenefit,
}: {
  form: any;
  control: any;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  category: string;
  setCategory: (category: string) => void;
  templates: any[];
  resFields: any[];
  addRes: (field: { value: string }) => void;
  removeRes: (index: number) => void;
  addReq: (field: { value: string }) => void;
  removeReq: (index: number) => void;
  reqFields: any[];
  register: any;
  benefitsFields: any[];
  addBenefit: (field: { value: string }) => void;
  removeBenefit: (index: number) => void;
}) => {
  return (
    <>
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Job Title</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Frontend Developer" {...field} />
            </FormControl>
            <FormDescription>
              This is the title of the job posting.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
        <FormField
          control={control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Nigeria" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State or Region</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Lagos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Lekki" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-10">
        <FormField
          control={control}
          name="jobType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(JobType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="employmentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(EmploymentType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatSource(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="experienceLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Experience Level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="entry">Entry</SelectItem>
                  <SelectItem value="mid">Mid</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="yearsOfExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Years of Experience</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Years" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0-1">0-1</SelectItem>
                  <SelectItem value="1-3">1-3</SelectItem>
                  <SelectItem value="3-5">3-5</SelectItem>
                  <SelectItem value="5+">5+</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="qualification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qualification</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Qualification" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="high_school">High School</SelectItem>
                  <SelectItem value="bachelor">Bachelor&apos;s</SelectItem>
                  <SelectItem value="master">Master&apos;s</SelectItem>
                  <SelectItem value="phd">Ph.D</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4 my-10">
        <h4 className="text-xl font-medium">
          Job Description & Responsibilities
        </h4>

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between my-2">
                <FormLabel>Description</FormLabel>
                <Button
                  type="button"
                  variant="link"
                  className="text-xl font-medium p-0"
                  disabled={isLoading}
                  onClick={async () => {
                    setIsLoading(true);
                    const res = await fetch("/api/suggest", {
                      method: "POST",
                      body: JSON.stringify({
                        jobTitle: form.watch("title"),
                        experience: form.watch("yearsOfExperience"),
                        category: form.watch("jobType"),
                        employmentType: form.watch("employmentType"),
                        experienceLevel: form.watch("experienceLevel"),
                      }),
                    });

                    const data = await res.json();
                    setIsLoading(false);

                    if (!res.ok) return;

                    if (data.description) {
                      form.setValue("description", data.description);
                    }
                    if (data.responsibilities) {
                      data.responsibilities.forEach((r: string) =>
                        addRes({ value: r })
                      );
                    }
                    if (data.requirements) {
                      data.requirements.forEach((r: string) =>
                        addReq({ value: r })
                      );
                    }
                    if (data.benefits) {
                      data.benefits.forEach((b: string) =>
                        addBenefit({ value: b })
                      );
                    }
                  }}
                >
                  <CentaAISuggest isLoading={isLoading} />
                </Button>
              </div>

              <FormControl>
                <Textarea
                  className="resize-none h-52"
                  placeholder="Enter a job description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Requirements</FormLabel>
          {reqFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-center">
              <Input
                {...register(`requirements.${index}.value`)}
                placeholder={`Requirement ${index + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeReq(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => addReq({ value: "" })}
          >
            + Add Responsibility
          </Button>
        </div>

        <div className="space-y-2">
          <FormLabel>Responsibilities</FormLabel>
          {resFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-center">
              <Input
                {...register(`responsibilities.${index}.value`)}
                placeholder={`Responsibility ${index + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeRes(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => addRes({ value: "" })}
          >
            + Add Responsibility
          </Button>
        </div>
      </div>

      <div className="space-y-2 my-10">
        <h4 className="text-xl font-medium">Benefits</h4>
        {benefitsFields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-center">
            <Input
              {...register(`benefits.${index}.value`)}
              placeholder={`Benefit ${index + 1}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeBenefit(index)}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => addBenefit({ value: "" })}
        >
          + Add Benefits
        </Button>
      </div>

      <div className="space-y-2 my-10">
        <h4 className="text-xl font-medium mb-3">Compensation</h4>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr.value} value={curr.value}>
                        {curr.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="salaryRangeFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary Range From</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 5000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="salaryRangeTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary Range To</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 8000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <FormField
        control={control}
        name="deadlineDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Application Deadline</FormLabel>
            <DateInput value={field.value} onChange={field.onChange} />
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2 my-10">
        <Controller
          control={form.control}
          name="pipelineTemplateId"
          render={({ field }) => (
            <PipelineTemplateSelector
              value={field.value}
              onChange={field.onChange}
              templates={templates}
            />
          )}
        />
        {form.formState.errors.pipelineTemplateId && (
          <p className="text-red-500 text-sm mt-1">
            Pipeline Template {form.formState.errors.pipelineTemplateId.message}
          </p>
        )}
      </div>
    </>
  );
};

export default JobDetailsForm;
