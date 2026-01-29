"use client";

import Link from "next/link";
import { Mail } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/ui/select";
import { Checkbox } from "@/shared/ui/checkbox";
import FormError from "@/shared/ui/form-error";
import DividerWithText from "@/shared/ui/DividerWithText";
import ApplicationLogo from "@/shared/ui/applicationLogo";

import { useRegister } from "../hooks/use-register";

export function RegisterView() {
  const { form, stage, error, stageError, handleNext, handleBack, onSubmit } =
    useRegister();

  const { control } = form;

  return (
    <section className="flex flex-col justify-between">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center ">
              <ApplicationLogo
                className="h-16 w-32 ml-2"
                src="https://centa-hr.s3.eu-west-3.amazonaws.com/company-files/55df5e55-f3e0-44c6-a39f-390ef8466d56/9a3be800-ca54-4bf9-a3ed-72b68baf52f7/1768990436384-logo-CqG_6WrI.svg"
                alt="Logo"
              />
            </div>
            <h2 className="text-2xl font-medium text-center mb-2">
              Get started in two simple steps
            </h2>
          </div>

          {/* stage indicator */}
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
                  control={control}
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                              type="button"
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

              {error ? <FormError message={error} /> : null}

              <div className="flex justify-between">
                <Button type="button" variant="secondary" onClick={handleBack}>
                  Back
                </Button>
                <Button type="submit" isLoading={form.formState.isSubmitting}>
                  Start Free Trial
                </Button>
              </div>
            </>
          )}

          <DividerWithText className="my-6" />

          <p className="text-right text-textSecondary text-md">
            Already have an Account?{" "}
            <Link href="/login">
              <Button
                variant="link"
                className="text-buttonPrimary px-0 font-bold"
                type="button"
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
