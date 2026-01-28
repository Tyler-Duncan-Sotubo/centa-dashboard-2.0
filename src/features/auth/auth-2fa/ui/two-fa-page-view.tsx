"use client";

import DividerWithText from "@/shared/ui/DividerWithText";
import ApplicationLogo from "@/shared/ui/applicationLogo";
import { Button } from "@/shared/ui/button";
import { useTwoFA } from "../hooks/use-two-fa";
import { TwoFAForm } from "./two-fa-form";

export function TwoFAPageView() {
  const {
    email,
    form,
    verifyError,
    resendError,
    resendVisible,
    handleCodeSubmit,
    handleResendCode,
  } = useTwoFA();

  return (
    <div>
      <div className="flex items-center justify-center">
        <ApplicationLogo
          className="h-16 w-32 ml-2"
          src="https://centa-hr.s3.eu-west-3.amazonaws.com/company-files/55df5e55-f3e0-44c6-a39f-390ef8466d56/9a3be800-ca54-4bf9-a3ed-72b68baf52f7/1768990436384-logo-CqG_6WrI.svg"
          alt="Logo"
        />
      </div>

      <h1 className="text-3xl font-bold my-4 text-center">Hold up.</h1>

      <p className="text-center mb-6 text-sm">
        Protecting your account is one of our top priorities!
        <br />
        Please confirm your account by entering the authentication code sent to:
        <span className="font-semibold"> {email}</span>
      </p>

      <TwoFAForm
        form={form}
        onSubmit={handleCodeSubmit}
        verifyError={verifyError}
      />

      <div className="text-center text-sm mt-6">
        It may take a few minutes to receive your code.
        <DividerWithText className="my-4" />
        {!resendVisible ? (
          <Button
            variant="link"
            onClick={handleResendCode}
            className="text-blue-500 font-semibold text-sm"
          >
            Send me a new code
          </Button>
        ) : (
          <p className="text-green-600 font-semibold">
            Code resent successfully.
          </p>
        )}
        {resendError && <p className="text-red-500 text-sm">{resendError}</p>}
      </div>
    </div>
  );
}
