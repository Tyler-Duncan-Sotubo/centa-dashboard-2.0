import {
  FormControl,
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
import { Department, EmployeeGroup } from "@/types/employees.type";
import React from "react";
import { FormType } from "./EmployeeInvite";
import { JobRole } from "@/types/job-roles.type";
import { Button } from "@/components/ui/button";
import JobRoleModal from "@/app/dashboard/company/job-roles/_components/JobRoleModal";
import DepartmentModal from "@/app/dashboard/company/departments/_components/DepartmentModal";
import { PayGroupModal } from "@/components/PayGroupModal";
import { LocationModal } from "@/components/LocationModal";

export const WorkInformation = ({
  form,
  groups,
  departments,
  jobRoles,
  locations,
}: {
  form: FormType;
  departments?: Department[];
  groups?: EmployeeGroup[];
  jobRoles?: JobRole[];
  locations?: Array<{ name: string; id: string }>;
  costCenters?: Array<{ name: string }>;
}) => {
  const [isJobRoleOpen, setIsJobRoleOpen] = React.useState(false);
  const [isDepartmentOpen, setIsDepartmentOpen] = React.useState(false);
  const [isLocationOpen, setIsLocationOpen] = React.useState(false);
  const [isPayGroupOpen, setIsPayGroupOpen] = React.useState(false);

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "hr_manager", label: "HR Manager" },
    { value: "hr_assistant", label: "HR Assistant" },
    { value: "recruiter", label: "Recruiter" },
    { value: "payroll_specialist", label: "Payroll Specialist" },
    { value: "benefits_admin", label: "Benefits Admin" },
    { value: "finance_manager", label: "Finance Manager" },
    { value: "manager", label: "Manager" },
    { value: "team_lead", label: "Team Lead" },
    { value: "employee", label: "Team Member" },
    { value: "auditor", label: "Auditor" },
    { value: "it_support", label: "IT Support" },
  ];

  const HandleAddExtra = ({ label }: { label: string }) => {
    return (
      <div className="flex items-center justify-between my-0">
        <FormLabel required className="my-0">
          {label}
        </FormLabel>
        <Button
          variant={"link"}
          className="p-0 m-0 h-6"
          type="button"
          onClick={() => {
            if (label === "Job Role") {
              setIsJobRoleOpen(true);
            } else if (label === "Department") {
              setIsDepartmentOpen(true);
            } else if (label === "Pay Group") {
              setIsPayGroupOpen(true);
            } else if (label === "Location") {
              setIsLocationOpen(true);
            }
          }}
        >
          Add New
        </Button>
      </div>
    );
  };

  return (
    <section>
      <h3 className="text-xl font-semibold">Work</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          name="departmentId"
          control={form.control}
          defaultValue={form.getValues("departmentId") || ""} // Ensure default value
          render={({ field }) => (
            <FormItem>
              <HandleAddExtra label="Department" />
              <Select
                onValueChange={(value) => field.onChange(value)}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((department, index) => (
                    <SelectItem key={index} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="payGroupId"
          control={form.control}
          defaultValue={form.getValues("payGroupId") || ""} // Ensure default value
          render={({ field }) => (
            <FormItem>
              <HandleAddExtra label="Pay Group" />
              <Select
                onValueChange={(value) => field.onChange(value)}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Pay Group" />
                </SelectTrigger>
                <SelectContent>
                  {groups?.map((group, index) => (
                    <SelectItem key={index} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="jobRoleId"
          control={form.control}
          defaultValue={form.getValues("jobRoleId") || ""} // Ensure default value
          render={({ field }) => (
            <FormItem>
              <HandleAddExtra label="Job Role" />
              <Select
                onValueChange={(value) => field.onChange(value)}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Job Role" />
                </SelectTrigger>
                <SelectContent>
                  {jobRoles?.map((role, index) => (
                    <SelectItem key={index} value={role.id}>
                      {role.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="locationId"
          control={form.control}
          defaultValue={form.getValues("locationId") || ""} // Ensure default value
          render={({ field }) => (
            <FormItem>
              <HandleAddExtra label="Location" />
              <Select
                onValueChange={(value) => field.onChange(value)}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations?.map((role, index) => (
                    <SelectItem key={index} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* This is the second column */}
        <FormField
          name="employmentStatus"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="probation">Probation</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="resigned">Resigned</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="employmentStartDate"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Start Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="probationEndDate"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Probation End Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="confirmed"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Is Confirmed</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={String(field.value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="role"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <JobRoleModal
        isOpen={isJobRoleOpen}
        onClose={() => setIsJobRoleOpen(false)}
      />
      <DepartmentModal
        isOpen={isDepartmentOpen}
        onClose={() => setIsDepartmentOpen(false)}
      />

      <PayGroupModal
        isOpen={isPayGroupOpen}
        onClose={() => setIsPayGroupOpen(false)}
      />

      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
      />
    </section>
  );
};
