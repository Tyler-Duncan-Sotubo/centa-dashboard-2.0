import { PasswordResetConfirmView } from "@/features/auth/password-reset-confirm/ui/password-reset-confirm-view";

type PageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { token } = await params;

  return <PasswordResetConfirmView token={token} />;
}
