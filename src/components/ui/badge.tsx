import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3.5 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-300 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        // Premium gradient variant - main brand style
        premium:
          "border-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white shadow-[0_4px_14px_0_rgba(147,51,234,0.5)] hover:shadow-[0_8px_25px_rgba(147,51,234,0.7)] hover:scale-105 active:scale-95 relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700",
        // Success gradient variant
        success:
          "border-transparent bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-[0_4px_14px_0_rgba(16,185,129,0.5)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.7)] hover:scale-105 active:scale-95",
        // Warning gradient variant  
        warning:
          "border-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-[0_4px_14px_0_rgba(245,158,11,0.5)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.7)] hover:scale-105 active:scale-95",
        // Info gradient variant
        info:
          "border-transparent bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white shadow-[0_4px_14px_0_rgba(59,130,246,0.5)] hover:shadow-[0_8px_25px_rgba(59,130,246,0.7)] hover:scale-105 active:scale-95",
        // Rose/Pink gradient variant
        rose:
          "border-transparent bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 text-white shadow-[0_4px_14px_0_rgba(244,63,94,0.5)] hover:shadow-[0_8px_25px_rgba(244,63,94,0.7)] hover:scale-105 active:scale-95",
        // Minimal gradient (subtle)
        gradient:
          "border-transparent bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/50 dark:hover:to-blue-900/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
