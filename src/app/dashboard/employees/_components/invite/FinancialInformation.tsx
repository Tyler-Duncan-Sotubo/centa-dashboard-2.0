"use client";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormType } from "./EmployeeInvite";
import React, { useEffect, useState } from "react";
import { nigerianBanks } from "@/data/banks.data";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { getErrorMessage } from "@/utils/getErrorMessage";

const FinancialInformation = ({ form }: { form: FormType }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const { bankName, bankAccountNumber } = form.watch();
  const [prevBank, setPrevBank] = useState(bankName);
  const [prevAccountNumber, setPrevAccountNumber] = useState(bankAccountNumber);

  // Function to verify bank details
  const verifyBankDetails = async (accountNumber: string, bankName: string) => {
    if (!accountNumber || !bankName) return;

    setIsVerifying(true);

    // Get the bank code from the selected bank name
    const selectedBank = nigerianBanks.find((bank) => bank.name === bankName);
    const bankCode = selectedBank?.code;

    if (!bankCode) {
      setError("Invalid bank selected.");
      setIsVerifying(false);
      return;
    }

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/employee-finance/verify-account/${accountNumber}/${bankCode}`
      );

      if (res.data?.status) {
        form.setValue("bankAccountName", res.data.data.account_name);
        toast({
          variant: "success",
          title: "Account Verified",
          description: `Account Name: ${res.data.data.account_name}`,
        });
        setError(null);
      } else {
        setError("Invalid account details. Please check again.");
      }
    } catch (error) {
      getErrorMessage(error);
      setError("Failed to verify account. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Use effect to automatically verify when bank name or account number changes
  useEffect(() => {
    if (bankName !== prevBank || bankAccountNumber !== prevAccountNumber) {
      setPrevBank(bankName);
      setPrevAccountNumber(bankAccountNumber);

      // Delay API call to prevent excessive requests
      const timeout = setTimeout(() => {
        verifyBankDetails(bankAccountNumber, bankName);
      }, 1000);

      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankAccountNumber, bankName]);

  return (
    <section className="shadow-md rounded-md px-6 py-10 bg-white border border-sidebar mt-10">
      <h3 className="text-xl font-semibold">Financial & Compensation Info</h3>
      <div className="grid grid-cols-2 gap-10 mt-4">
        {/* Gross Salary */}
        <FormField
          name="grossSalary"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Gross Salary</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Pay Frequency */}

        <FormField
          name="tin"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Tax Identification Number</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="pensionPin"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Pension Pin</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="nhfNumber"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>NHF Number</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="bankName"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Bank Name</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Bank" />
                </SelectTrigger>
                <SelectContent>
                  {nigerianBanks.map((bank, index) => (
                    <SelectItem key={index} value={bank.name}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="bankAccountNumber"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Account Number</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="bankAccountName"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Account Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                  disabled
                  placeholder="MICHEAL MUSA"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Apply NHF */}
        <FormField
          name="applyNHf"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apply N.H.F</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value?.toString()}
                  onValueChange={(value) => field.onChange(value === "true")}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="nhf-yes" />
                    <FormLabel htmlFor="nhf-yes">Yes</FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="nhf-no" />
                    <FormLabel htmlFor="nhf-no">No</FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isVerifying && <p className="text-blue-500 text-lg">Verifying...</p>}
        {error && (
          <p className="text-red-500 text-lg">
            {error}
            <button
              onClick={() => setError(null)}
              className="text-blue-500 ml-2"
            >
              Close
            </button>
          </p>
        )}
      </div>
    </section>
  );
};

export default FinancialInformation;
