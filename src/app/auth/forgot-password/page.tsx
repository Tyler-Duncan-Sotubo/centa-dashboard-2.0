"use client";

import { useState } from "react";
import { isAxiosError } from "@/lib/axios";
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
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Input } from "@/components/ui/input";
import FormError from "@/components/ui/form-error";
import { requestPasswordResetSchema } from "../schema/password";
import Link from "next/link";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import DividerWithText from "@/components/ui/DividerWithText";
import { Mail } from "lucide-react";
import ApplicationLogo from "@/components/ui/applicationLogo";

const PasswordReset = () => {
  const axiosInstance = useAxiosAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof requestPasswordResetSchema>>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof requestPasswordResetSchema>) {
    setError("");
    try {
      const res = await axiosInstance.post(`/api/auth/password-reset`, values, {
        withCredentials: true,
      });

      if (res.status === 201) {
        setSuccess(true);
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
  }

  if (success) {
    return (
      <section className="flex flex-col justify-between mx-auto">
        <div className="flex items-center justify-center">
          <ApplicationLogo
            className="h-16 w-32 ml-2"
            src="https://res.cloudinary.com/dw1ltt9iz/image/upload/v1760181502/favicon_bp8qfr.svg"
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
          <Button
            className="w-full"
            onClick={() => {
              setSuccess(false);
              form.reset();
            }}
          >
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
              src="https://res.cloudinary.com/dw1ltt9iz/image/upload/v1760181502/favicon_bp8qfr.svg"
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
        <Link href="/auth/login">
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
};

export default PasswordReset;
