import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:ring-offset-2 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 focus-visible:ring-orange-500/30",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 focus-visible:ring-red-500/30",
        outline:
          "border-2 border-orange-200 bg-white/80 backdrop-blur-sm text-orange-600 shadow-sm hover:bg-orange-50 hover:border-orange-300 hover:shadow-md focus-visible:ring-orange-500/20",
        secondary:
          "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 shadow-sm hover:from-gray-200 hover:to-gray-300 hover:shadow-md focus-visible:ring-gray-500/20",
        ghost:
          "text-gray-600 hover:bg-orange-50 hover:text-orange-600 focus-visible:ring-orange-500/20",
        link: 
          "text-orange-600 underline-offset-4 hover:underline hover:text-orange-700 focus-visible:ring-orange-500/20",
        gradient:
          "bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:from-orange-500 hover:via-red-600 hover:to-pink-600 focus-visible:ring-orange-500/30",
        glass:
          "bg-white/20 backdrop-blur-lg border border-white/30 text-gray-700 shadow-lg hover:bg-white/30 hover:shadow-xl focus-visible:ring-white/30",
        success:
          "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-600 focus-visible:ring-green-500/30",
      },
      size: {
        default: "h-10 px-6 py-2 has-[>svg]:px-4",
        sm: "h-8 rounded-lg gap-1.5 px-4 text-xs has-[>svg]:px-3",
        lg: "h-12 rounded-xl px-8 text-base has-[>svg]:px-6",
        xl: "h-14 rounded-2xl px-10 text-lg has-[>svg]:px-8",
        icon: "size-10 rounded-xl",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
