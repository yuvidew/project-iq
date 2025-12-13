// src/components/ui/dialog.tsx
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

// -----------------------------
// Root + Trigger (responsive)
// -----------------------------
type ResponsiveDialogRootProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
  children: React.ReactNode
}

function Dialog({ children, ...props }: ResponsiveDialogRootProps) {
  const isMobile = useIsMobile()

  return isMobile ? (
    <Drawer data-slot="drawer" {...props}>
      {children}
    </Drawer>
  ) : (
    <DialogPrimitive.Root data-slot="dialog" {...props}>
      {children}
    </DialogPrimitive.Root>
  )
}

type ResponsiveDialogTriggerProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>

function DialogTrigger(props: ResponsiveDialogTriggerProps) {
  const isMobile = useIsMobile()

  return isMobile ? (
    <DrawerTrigger data-slot="drawer-trigger" {...(props as any)} />
  ) : (
    <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
  )
}

// -----------------------------
// Overlay (desktop only)
// -----------------------------
function DialogOverlay({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

// -----------------------------
// Content (responsive)
// NOTE: On mobile DO NOT render <Drawer /> here,
// it must only render <DrawerContent />.
// -----------------------------
type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  title?: string
  description?: string
  showCloseButton?: boolean
}

function DialogContent({
  title = "Command Palette",
  description = "Search for a command to run...",
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogContentProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DrawerContent data-slot="drawer-content" className={cn("max-h-full px-6 pb-20", className)}>

        {/* <div className=" p-6"> */}
          {children}
        {/* </div> */}
      </DrawerContent>
    )
  }

  return (
    <DialogPrimitive.Portal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}

      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

// -----------------------------
// Desktop-only Radix re-exports
// -----------------------------
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogHeader = ({ className, ...props }: React.ComponentPropsWithoutRef<"div">) => (
  <div
    data-slot="dialog-header"
    className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
    {...props}
  />
)

const DialogFooter = ({ className, ...props }: React.ComponentPropsWithoutRef<"div">) => (
  <div
    data-slot="dialog-footer"
    className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
    {...props}
  />
)

const DialogTitle = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) => (
  <DialogPrimitive.Title
    data-slot="dialog-title"
    className={cn("text-lg leading-none font-semibold", className)}
    {...props}
  />
)

const DialogDescription = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) => (
  <DialogPrimitive.Description
    data-slot="dialog-description"
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
)

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
