"use client";

import Link from "next/link";
import { Mail } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import DividerWithText from "@/shared/ui/DividerWithText";
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

import { usePasswordReset } from "../hooks/use-password-reset";

export function PasswordResetView() {
  const { form, error, success, onSubmit, resetFlow } = usePasswordReset();

  if (success) {
    return (
      <section className="flex flex-col justify-between mx-auto">
        <div className="flex items-center justify-center">
          <ApplicationLogo
            className="h-16 w-32 ml-2"
            src="https://centa-hr.s3.eu-west-3.amazonaws.com/company-files/55df5e55-f3e0-44c6-a39f-390ef8466d56/9a3be800-ca54-4bf9-a3ed-72b68baf52f7/1768990436384-logo-CqG_6WrI.svg"
            alt="Logo"
          />
        </div>

        <h1 className="text-3xl font-bold text-center my-2">
          Password Reset Link Sent
        </h1>

        <p className="text-center text-gray-600 text-md">
          We have sent you an email with a link to reset your password. If you
          do not receive the email within a few minutes, please check your spam
          folder.
        </p>

        <div className="flex justify-center mt-4">
          <Button className="w-full" onClick={resetFlow}>
            Send Another Link
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col justify-between">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex items-center justify-center">
            <ApplicationLogo
              className="h-16 w-32 ml-2"
              src="https://centa-hr.s3.eu-west-3.amazonaws.com/company-files/55df5e55-f3e0-44c6-a39f-390ef8466d56/9a3be800-ca54-4bf9-a3ed-72b68baf52f7/1768990436384-logo-CqG_6WrI.svg"
              alt="Logo"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold my-2">Forgot Your Password?</h1>
            <h3 className="text-2xl text-gray-600">
              We&apos;ve got you covered
            </h3>
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
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

          {error && <FormError message={error} />}

          <Button
            type="submit"
            isLoading={form.formState.isSubmitting}
            className="w-full"
          >
            Send Password Reset Link
          </Button>
        </form>
      </Form>

      <DividerWithText className="my-6" />

      <div className="text-md px-3 text-center">
        <Link href="/login">
          <Button
            variant="link"
            className="text-buttonPrimary font-bold text-sm"
          >
            Back to sign in
          </Button>
        </Link>
      </div>
    </section>
  );
}
