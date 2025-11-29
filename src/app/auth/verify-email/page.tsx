"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { axiosInstance, isAxiosError } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { getErrorMessage } from "@/utils/getErrorMessage";
import FormError from "@/components/ui/form-error";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the schema for validation
const VerifyEmailSchema = z.object({
  token: z.string().length(6, "OTP must be exactly 6 digits"),
});

function VerifyEmail() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof VerifyEmailSchema>>({
    resolver: zodResolver(VerifyEmailSchema),
    defaultValues: {
      token: "",
    },
  });

  async function onSubmit(values: z.infer<typeof VerifyEmailSchema>) {
    setError(null);
    try {
      const res = await axiosInstance.post("/api/auth/verify-email", values);
      if (res.status === 201) {
        toast({
          variant: "success",
          title: "Email Verified",
          description: "Your email has been successfully verified!",
        });
        router.push("/auth/login"); // Redirect user after successful verification
      }
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        setError(error.response.data.error.message);
      } else {
        setError(getErrorMessage(error));
      }
    }
  }

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
              className="space-y-6 flex flex-col justify-center items-center "
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

              {error && <FormError message={error} />}

              <Button
                type="submit"
                className="w-full"
                isLoading={form.formState.isSubmitting}
              >
                Verify Email
              </Button>
            </form>
          </Form>

          {/* Resend OTP */}
          <p className="text-center text-sm text-gray-500">
            Didn’t receive a code?{" "}
            <button
              className="text-blue-600 hover:underline"
              onClick={() => alert("Resending OTP...")}
            >
              Resend
            </button>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

export default VerifyEmail;
