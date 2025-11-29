"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { passwordResetSchema } from "../../schema/password";

import useAxiosAuth from "@/hooks/useAxiosAuth";
type Params = {
  params: {
    token: string;
  };
};

const VerifyInvitation = ({ params }: Params) => {
  const [loading, setLoading] = useState(true);
  const axiosInstance = useAxiosAuth();
  const [error, setError] = useState("");
  const router = useRouter();
  const hasVerified = useRef(false);

  const form = useForm<z.infer<typeof passwordResetSchema>>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    const token = params.token;
    if (!token) {
      setError("Invalid or expired invitation link.");
      setLoading(false);
      return;
    }

    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyInvite = async () => {
      try {
        const response = await axiosInstance.post(`/api/auth/invite/${token}`);
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }

        // Set email in form after API response
        form.reset({
          email: response.data.data.email,
          password: "",
          password_confirmation: "",
        });
      } catch (err) {
        console.log(err);
        setError("Invalid or expired invitation.");
      } finally {
        setLoading(false);
      }
    };

    verifyInvite();
  }, [params.token, form, axiosInstance]);

  async function onSubmit(values: z.infer<typeof passwordResetSchema>) {
    if (!values.email || !values.password) {
      alert("Please enter both email and password");
      return;
    }

    setError("");

    try {
      const res = await axiosInstance.post(
        `/api/auth/invite-password-reset/${params.token}`,
        values,
        {
          withCredentials: true,
        }
      );

      if (res.status === 200) {
        router.push(`${process.env.NEXT_PUBLIC_CLIENT_URL}/auth/login`);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-600">
            Verifying your invitation...
          </p>
          <p className="text-sm text-gray-500">
            Please wait while we confirm your access.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md text-center max-w-md">
          <h2 className="text-xl font-semibold">Invalid or Expired Token</h2>
          <p className="mt-2">
            The invitation link is either invalid or has expired. Please contact
            your administrator for a new invitation.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 transition"
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="flex flex-col mt-32 justify-between">
      <Form {...form}>
        <h1 className="text-2xl font-bold text-center">
          Your Invitation is Ready
        </h1>
        <p className="text-center text-gray-600 text-sm">
          Please set a new password to continue.
        </p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 px-6 py-6 w-[70%] mx-auto"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" {...field} disabled />
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

          {error && <FormError message={error} />}

          <Button type="submit" isLoading={loading} className="w-full">
            Reset Password
          </Button>
        </form>
      </Form>
    </section>
  );
};

export default VerifyInvitation;
