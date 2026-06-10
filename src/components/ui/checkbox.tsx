"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Checkbox({ className, label, id, ...props }: CheckboxProps) {
  const inputId = id ?? props.name
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={inputId}
        className={cn(
          "h-4 w-4 cursor-pointer rounded border border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
      {label && (
        <label htmlFor={inputId} className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
    </div>
  )
}
