"use client";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import ApplicationLogo from "@/shared/ui/applicationLogo";
import FormError from "@/shared/ui/form-error";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";

import { usePasswordResetConfirm } from "../hooks/use-password-reset-confirm";
import Link from "next/link";

export function PasswordResetConfirmView({ token }: { token: string }) {
  const { form, error, onSubmit } = usePasswordResetConfirm(token);

  return (
    <section className="flex flex-col justify-between">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 px-6 py-6 w-full mx-auto"
        >
          <div className="flex items-center justify-center">
            <ApplicationLogo
              className="h-16 w-32 ml-2"
              src="https://centa-hr.s3.eu-west-3.amazonaws.com/company-files/55df5e55-f3e0-44c6-a39f-390ef8466d56/9a3be800-ca54-4bf9-a3ed-72b68baf52f7/1768990436384-logo-CqG_6WrI.svg"
              alt="Logo"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Reset Your Password</h1>
            <p className="text-gray-600 text-xl">
              Enter new password to reset your password.
            </p>
          </div>
          <div className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
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
              control={form.control}
              name="password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
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
          <div className="text-xs col-span-1">
            {error ? <FormError message={error} /> : null}
          </div>
          <div>
            {error &&
              (error.includes("Token is not valid") ||
                error.includes("Token has already been used") ||
                error.includes("Token has expired")) && (
                <div>
                  <Link href="/forgot-password">
                    <Button variant="outline">
                      Request a new password reset link
                    </Button>
                  </Link>
                </div>
              )}
          </div>

          {!error && (
            <Button
              type="submit"
              isLoading={form.formState.isSubmitting}
              className="w-full mt-6"
            >
              Reset Password
            </Button>
          )}
        </form>
      </Form>
    </section>
  );
}
