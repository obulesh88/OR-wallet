"use client"

import { cn } from "@/lib/utils"
import * as React from "react"

const List = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => {
    return (
      <ul
        ref={ref}
        className={cn(
          "divide-y divide-border rounded-md border text-sm",
          className
        )}
        {...props}
      />
    )
  }
)
List.displayName = "List"

const ListItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement> & {
    title?: React.ReactNode
    asChild?: boolean
  }
>(({ className, children, title, asChild = false, ...props }, ref) => {
  const Comp = asChild ? "div" : "li"
  return (
    <Comp
      ref={ref}
      className={cn(
        "relative flex flex-col p-3",
        "[&:not(:first-child)]:pt-3",
        "[&:not(:last-child)]:pb-3",
        "has-[[data-button]]:pr-12 has-[[data-button]]:sm:pr-10",
        className
      )}
      {...props}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex-1 space-y-1.5">
          {title && <div className="font-semibold">{title}</div>}
          {children && (
            <div
              className={cn("text-muted-foreground", !title && "font-medium")}
            >
              {children}
            </div>
          )}
        </div>
      </div>
    </Comp>
  )
})
ListItem.displayName = "ListItem"

export { List, ListItem }
