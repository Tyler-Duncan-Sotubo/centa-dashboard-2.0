"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { FormType } from "./EmployeeInvite";
import React from "react";
import { Switch } from "@/shared/ui/switch";

const DependentsForm = ({ form }: { form: FormType }) => {
  return (
    <section className="shadow-md rounded-md px-6 py-10 bg-white border border-sidebar mt-10">
      <h3 className="text-xl font-semibold mb-4">Dependents</h3>

      {/* Example layout for adding 1 dependent (you can extend to dynamic later) */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Name */}
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Sarah Doe" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Relationship */}
        <FormField
          name="relationship"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relationship</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Daughter, Son, Spouse" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date of Birth */}
        <FormField
          name="dependentDob"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Beneficiary switch */}
      <FormField
        name="isBeneficiary"
        control={form.control}
        render={({ field }) => (
          <FormItem className="flex items-center space-x-3">
            <FormLabel>Is Beneficiary?</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
};

export default DependentsForm;
