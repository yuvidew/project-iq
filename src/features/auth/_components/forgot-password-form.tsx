"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FolderOpenIcon } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormValue = z.infer<typeof ForgotPasswordSchema>;

const successMessage = "If this email exists, we sent a reset link.";

const getResponseErrorMessage = async (response: Response) => {
  const payload = (await response.json().catch(() => null)) as {
    message?: string;
    error?: { message?: string };
  } | null;

  return (
    payload?.message ??
    payload?.error?.message ??
    "Something went wrong. Please try again."
  );
};

export const ForgotPasswordForm = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const form = useForm<ForgotPasswordFormValue>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (value: ForgotPasswordFormValue) => {
    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: value.email,
          redirectTo: "/reset-password",
        }),
      });

      if (!response.ok) {
        throw new Error(await getResponseErrorMessage(response));
      }

      toast.success(successMessage);
      form.reset();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      toast.error(message);
    }
  };

  const isPending = form.formState.isSubmitting;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center text-center">
              <Button size="icon" type="button">
                <FolderOpenIcon />
              </Button>
              <h1 className="text-2xl font-bold">Forgot password</h1>
              <p className="text-muted-foreground text-balance">
                Enter your email and we&apos;ll send a reset link
              </p>
            </div>
            <div className="grid gap-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button disabled={isPending} type="submit" className="w-full">
              {isPending ? <Spinner /> : "Send reset link"}
            </Button>
            <div className="text-center text-sm">
              Remember your password?{" "}
              <Link href="/sign-in" className="underline underline-offset-4">
                Sign in
              </Link>
            </div>
          </div>
        </form>
      </Form>
      <FieldDescription className="px-6 text-center">
        We&apos;ll only email a password reset link. No verification code is
        required.
      </FieldDescription>
    </div>
  );
};
