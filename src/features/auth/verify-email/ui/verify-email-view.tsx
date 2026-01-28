"use client";

import React from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import FormError from "@/shared/ui/form-error";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/ui/form";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/shared/ui/input-otp";

import { useVerifyEmail } from "../hooks/use-verify-email";

export function VerifyEmailView() {
  const { form, error, onSubmit, resendOtp, resending, resendSuccess } =
    useVerifyEmail();

  return (
    <section className="flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">
            Verify Your Email
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            We have sent a 6-digit verification code to your email. Enter it
            below to continue.
          </p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 flex flex-col justify-center items-center"
            >
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputOTP
                        {...field}
                        maxLength={6}
                        containerClassName="justify-center"
                        className="text-xl tracking-widest"
                      >
                        <InputOTPGroup>
                          {[...Array(6)].map((_, index) => (
                            <React.Fragment key={index}>
                              <InputOTPSlot index={index} />
                              {index === 2 && <InputOTPSeparator />}
                            </React.Fragment>
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error ? <FormError message={error} /> : null}

              <Button
                type="submit"
                className="w-full"
                isLoading={form.formState.isSubmitting}
              >
                Verify Email
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-gray-500">
            Didn’t receive a code?{" "}
            <button
              type="button"
              className="text-blue-600 hover:underline disabled:opacity-60"
              onClick={resendOtp}
              disabled={resending}
            >
              {resending ? "Resending..." : "Resend"}
            </button>
          </p>

          {resendSuccess ? (
            <p className="text-center text-sm text-green-600 font-medium">
              A new code has been sent.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
