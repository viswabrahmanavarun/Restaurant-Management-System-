"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

/* ------------------------------------------------------------------
   CUSTOM TOASTER COMPONENT
   - This listens to ALL toast events from useToast()
   - Renders them using your updated toast.tsx UI components
   - ToastViewport is already placed at TOP-RIGHT (controlled in toast.tsx)
------------------------------------------------------------------- */

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>

          {action}

          <ToastClose />
        </Toast>
      ))}

      {/* 🔥 This is what actually positions toast top-right */}
      <ToastViewport />
    </ToastProvider>
  )
}
