import { ForgotPasswordForm } from "@/features/auth/_components/forgot-password-form";
import { requireUnAuth } from "@/lib/auth-utils";

const ForgotPasswordPage = async () => {
  await requireUnAuth();

  return <ForgotPasswordForm />;
};

export default ForgotPasswordPage;
