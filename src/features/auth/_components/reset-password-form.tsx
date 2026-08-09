"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, FolderOpenIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
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

const ResetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValue = z.infer<typeof ResetPasswordSchema>;

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

export const ResetPasswordForm = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const form = useForm<ResetPasswordFormValue>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (value: ResetPasswordFormValue) => {
    if (!token) {
      toast.error("Reset link is invalid or expired.");
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword: value.newPassword,
          token,
        }),
      });

      if (!response.ok) {
        throw new Error(await getResponseErrorMessage(response));
      }

      toast.success("Password reset successfully");
      router.push("/sign-in");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      toast.error(message);
    }
  };

  if (!token || error === "INVALID_TOKEN") {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <Button size="icon" type="button">
              <FolderOpenIcon />
            </Button>
            <h1 className="text-2xl font-bold">Reset link expired</h1>
            <p className="text-muted-foreground text-balance">
              Request a new password reset link to continue
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href="/forgot-password">Request new link</Link>
          </Button>
          <div className="text-center text-sm">
            Remember your password?{" "}
            <Link href="/sign-in" className="underline underline-offset-4">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold">Reset password</h1>
              <p className="text-muted-foreground text-balance">
                Choose a new password for your Project.IQ account
              </p>
            </div>
            <div className="grid gap-3">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={isNewPasswordVisible ? "text" : "password"}
                          placeholder="Password"
                          {...field}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="default"
                          className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer border-none bg-transparent outline-0 hover:bg-transparent"
                          onClick={() =>
                            setIsNewPasswordVisible(!isNewPasswordVisible)
                          }
                        >
                          {isNewPasswordVisible ? (
                            <Eye className="size-4 text-primary" />
                          ) : (
                            <EyeOff className="size-4 text-primary" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-3">
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={isConfirmPasswordVisible ? "text" : "password"}
                          placeholder="Confirm password"
                          {...field}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="default"
                          className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer border-none bg-transparent outline-0 hover:bg-transparent"
                          onClick={() =>
                            setIsConfirmPasswordVisible(
                              !isConfirmPasswordVisible,
                            )
                          }
                        >
                          {isConfirmPasswordVisible ? (
                            <Eye className="size-4 text-primary" />
                          ) : (
                            <EyeOff className="size-4 text-primary" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button disabled={isPending} type="submit" className="w-full">
              {isPending ? <Spinner /> : "Reset password"}
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
        After your password changes, sign in again with the new password.
      </FieldDescription>
    </div>
  );
};
