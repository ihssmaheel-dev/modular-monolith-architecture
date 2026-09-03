import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const Route = createFileRoute("/auth/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/20 p-4">
      <ForgotPasswordForm />
    </div>
  );
}
