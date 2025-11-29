"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import FormError from "@/components/ui/form-error";

import { isAxiosError } from "@/lib/axios";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useToast } from "@/hooks/use-toast";
import useAxiosAuth from "@/hooks/useAxiosAuth";

// ⬇️ Your single schema (must include all fields used below: firstName, lastName, email,
// password, passwordConfirmation, companyName, country, role, terms).
import { RegisterSchema } from "../schema/register";
import DividerWithText from "@/components/ui/DividerWithText";
import ApplicationLogo from "@/components/ui/applicationLogo";

type RegisterValues = z.infer<typeof RegisterSchema>;

function Register() {
  const axiosInstance = useAxiosAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [stage, setStage] = useState<0 | 1>(0);
  const [error, setError] = useState<string | null>(null); // API/server error
  const [stageError, setStageError] = useState<string | null>(null); // local "Next" check error

  const form = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      companyName: "",
      country: undefined as unknown as RegisterValues["country"],
      role: undefined as unknown as RegisterValues["role"],
      terms: true,
    },
    mode: "onSubmit",
  });

  // Basic local check for stage 1 before moving to stage 2
  function basicStageOneCheck(values: RegisterValues): string | null {
    const { firstName, lastName, email, password, passwordConfirmation } =
      values;

    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !email?.trim() ||
      !password ||
      !passwordConfirmation
    ) {
      return "Please fill in all required fields.";
    }

    // Lightweight email check (Zod will fully validate on submit anyway)
    const emailOk = /\S+@\S+\.\S+/.test(email);
    if (!emailOk) return "Please enter a valid email address.";

    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== passwordConfirmation) return "Passwords do not match.";

    return null;
  }

  async function handleNext() {
    setStageError(null);
    const values = form.getValues();

    const err = basicStageOneCheck(values);
    if (err) {
      setStageError(err);
      return;
    }
    setStage(1);
  }

  function handleBack() {
    setStageError(null);
    setStage(0);
  }

  async function onSubmit(values: RegisterValues) {
    setError(null);
    const domain = values.companyName.trim().toLowerCase().replace(/\s+/g, "-");

    try {
      const res = await axiosInstance.post(
        "/api/auth/register",
        { ...values, domain },
        { withCredentials: true }
      );

      if (res.status === 201) {
        toast({ variant: "success", title: "Account Created" });
        router.push(`/auth/verify-email`);
      }
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        setError(err.response.data?.error?.message ?? "Registration failed");
        return { error: getErrorMessage(err.response.data?.error?.message) };
      } else {
        return { error: getErrorMessage(err) };
      }
    }
  }

  const { control } = form;

  return (
    <section className="flex flex-col justify-between">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center ">
              <ApplicationLogo
                className="h-16 w-32 ml-2"
                src="https://res.cloudinary.com/dw1ltt9iz/image/upload/v1760181502/favicon_bp8qfr.svg"
                alt="Logo"
              />
            </div>
            <h2 className="text-2xl font-medium text-center mb-2">
              Get started in two simple steps
            </h2>
          </div>
          {/* Simple stage indicator */}
          <div className="h-2 w-full rounded bg-muted overflow-hidden">
            <div
              className="h-full bg-monzo-brandDark transition-all"
              style={{ width: stage === 0 ? "50%" : "100%" }}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={stage === 0 ? 50 : 100}
            />
          </div>

          {stage === 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  control={control as any}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>First Name</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Last Name</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        leftIcon={
                          <Mail className="h-5 w-5 text-muted-foreground" />
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DividerWithText className="my-6" text="Password" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                          className="py-4"
                          isPassword
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="passwordConfirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                          className="py-4"
                          isPassword
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Local stage error (Next checks) */}
              {stageError ? <FormError message={stageError} /> : null}

              <div className="flex justify-end gap-3">
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-center">
                Tell us about your company
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Company Name</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Country</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nigeria">Nigeria</SelectItem>
                          <SelectItem value="united Kingdom">
                            United Kingdom
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super_admin">Director</SelectItem>
                        <SelectItem value="hr_manager">HR Manager</SelectItem>
                        <SelectItem value="manager">
                          Manager/Supervisor
                        </SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="recruiter">Recruiter</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="terms"
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              field.onChange(!!checked)
                            }
                          />
                          <label
                            htmlFor="terms"
                            className="text-md text-textPrimary font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            I accept the{" "}
                            <Link href="/privacy">
                              <Button
                                variant="link"
                                className="text-buttonPrimary px-0 font-bold"
                              >
                                Privacy Policy
                              </Button>
                            </Link>
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* API/server error on final submit */}
              {error ? <FormError message={error} /> : null}

              <div className="flex justify-between">
                <Button type="button" variant="secondary" onClick={handleBack}>
                  Back
                </Button>
                <Button type="submit" isLoading={form.formState.isSubmitting}>
                  Start your 21-day free trial
                </Button>
              </div>
            </>
          )}
          <DividerWithText className="my-6" />
          <p className="text-right text-textSecondary text-md">
            Already have an Account?{" "}
            <Link href="/auth/login">
              <Button
                variant="link"
                className="text-buttonPrimary px-0 font-bold"
              >
                Login
              </Button>
            </Link>
          </p>
        </form>
      </Form>
    </section>
  );
}

export default Register;
