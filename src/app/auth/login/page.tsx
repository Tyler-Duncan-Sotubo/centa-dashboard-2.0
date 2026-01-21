"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import FormError from "@/components/ui/form-error";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { loginSchema } from "../schema/login";
import { isAxiosError } from "@/lib/axios";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import DividerWithText from "@/components/ui/DividerWithText";
import ApplicationLogo from "@/components/ui/applicationLogo";

function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (email: string, password: string) => {
    const response = await fetch("/api/custom-login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (data.error) {
      setError(data.error);
      return;
    }

    if (data.tempToken) {
      router.push(
        `/auth/2fa?token=${data.tempToken}&email=${encodeURIComponent(email)}`,
      );
      return;
    }

    const adminRoles = ["admin", "super_admin"];

    if (!adminRoles.includes(data.user.role)) {
      const userForNextAuth = {
        ...data.user,
        employeeId: data.user.id,
        userAccountId: data.user.userId ?? null,
      };

      const signInResult = await signIn("credentials", {
        redirect: false,
        user: JSON.stringify(userForNextAuth),
        backendTokens: JSON.stringify(data.backendTokens),
        permissions: JSON.stringify(data.permissions),
        checklist: JSON.stringify(data.checklist),
      });

      if (signInResult?.ok) {
        const destination =
          data.user.employmentStatus === "onboarding" ? "/onboarding" : "/ess";
        router.push(destination);
      }

      return;
    }

    try {
      // Call NextAuth signIn only if no verification is required
      const signInResult = await signIn("credentials", {
        redirect: false,
        user: JSON.stringify(data.user),
        backendTokens: JSON.stringify(data.backendTokens),
        permissions: JSON.stringify(data.permissions),
        checklist: JSON.stringify(data.checklist),
      });

      if (signInResult?.error) {
        setError(signInResult.error);
        return {
          error: getErrorMessage(signInResult.error),
        };
      }

      if (signInResult?.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        setError(error.response.data.message);
        return {
          error: getErrorMessage(error.response.data.message),
        };
      } else {
        return {
          error: getErrorMessage(error),
        };
      }
    }
  };

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    const email = values.email;
    const password = values.password;

    setError(null);
    await handleLogin(email, password);
  }

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
            {/* Display error message if there is one */}
            {error ? <FormError message={error} /> : ""}

            <section className="flex justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <label
                  htmlFor="terms"
                  className="text-md text-textPrimary font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>

              <Link href="/auth/forgot-password">
                <Button
                  variant="link"
                  className="text-buttonPrimary px-0 font-bold text-sm"
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

export default LoginForm;
