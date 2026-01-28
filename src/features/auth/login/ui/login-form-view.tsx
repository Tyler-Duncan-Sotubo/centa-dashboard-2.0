"use client";

import Link from "next/link";
import { Mail } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import DividerWithText from "@/shared/ui/DividerWithText";
import ApplicationLogo from "@/shared/ui/applicationLogo";
import FormError from "@/shared/ui/form-error";
import { Input } from "@/shared/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";

import { useLogin } from "../hooks/use-login";

export function LoginFormView() {
  const { form, error, onSubmit } = useLogin();

  return (
    <section>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <ApplicationLogo
                className="h-16 w-32 ml-2"
                src="https://centa-hr.s3.eu-west-3.amazonaws.com/company-files/55df5e55-f3e0-44c6-a39f-390ef8466d56/9a3be800-ca54-4bf9-a3ed-72b68baf52f7/1768990436384-logo-CqG_6WrI.svg"
                alt="Logo"
              />
            </div>

            <h1 className="text-2xl font-semibold text-center">
              Welcome to Centa
            </h1>
          </div>

          <div className="space-y-3">
            <FormField
              control={form.control}
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
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

            {error ? <FormError message={error} /> : null}

            <section className="flex justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="rememberMe" />
                <label
                  htmlFor="rememberMe"
                  className="text-md text-textPrimary font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>

              <Link href="/auth/forgot-password">
                <Button
                  variant="link"
                  className="text-buttonPrimary px-0 font-bold text-sm"
                  type="button"
                >
                  Forgot password?
                </Button>
              </Link>
            </section>

            <div className="flex justify-end">
              <Button
                type="submit"
                isLoading={form.formState.isSubmitting}
                className="w-full"
              >
                Log In
              </Button>
            </div>

            <DividerWithText className="my-10" />

            <div className="text-center text-textSecondary text-md flex justify-center items-center space-x-1">
              <p>Don&apos;t have an account?</p>
              <Link
                href="https://calendly.com/centapayroll/book-a-demo"
                target="_blank"
              >
                <Button
                  variant="link"
                  className="text-buttonPrimary px-0 font-bold text-sm"
                  type="button"
                >
                  Book a demo
                </Button>
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
}
