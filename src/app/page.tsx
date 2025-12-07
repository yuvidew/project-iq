"use client";

import {Button} from "@/components/ui/button"
import { useLogout } from "@/features/auth/hooks/use-logout";

export default function Home() {
  const {mutate, isPending} = useLogout()
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Button onClick={() => mutate()} disabled= {isPending}>
        Let's Got
      </Button>
    </div>
  );
}
