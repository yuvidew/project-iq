import { ResetPasswordForm } from "@/features/auth/_components/reset-password-form";
import { requireUnAuth } from "@/lib/auth-utils";

const ResetPasswordPage = async () => {
  await requireUnAuth();

  return <ResetPasswordForm />;
};

export default ResetPasswordPage;
