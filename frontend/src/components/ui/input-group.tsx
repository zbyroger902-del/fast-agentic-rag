import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        // Base layout: column for textarea, row for plain inputs
        "group/input-group has-[textarea]:flex-col has-[textarea]:divide-y",
        "flex w-full rounded-xl border border-slate-700/60 bg-slate-900/60",
        "shadow-sm transition-all duration-150",
        // Focus ring: highlight border when any child is focused
        "focus-within:border-slate-600 focus-within:ring-2 focus-within:ring-slate-700/40",
        className,
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "text-slate-400 gap-2 py-1.5 text-sm font-medium flex cursor-text items-center select-none",
  {
    variants: {
      align: {
        "inline-start": "pl-2 order-first",
        "inline-end": "pr-2 order-last",
        "block-start": "px-2.5 pt-2 order-first w-full justify-start",
        "block-end": "px-2.5 pb-2 order-last w-full justify-start",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  },
);

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      data-slot="input-group-addon"
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button, a, input")) return;
        e.currentTarget.parentElement?.querySelector("textarea")?.focus();
      }}
      {...props}
    />
  );
}

function InputGroupButton({
  className,
  type = "button",
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium",
        "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
        "transition-colors disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/50",
        "cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="input-group-control"
      className={cn(
        "flex field-sizing-content min-h-16 w-full px-3 py-2.5 text-sm",
        "text-slate-100 placeholder:text-slate-500",
        "resize-none rounded-none border-0 bg-transparent",
        "shadow-none ring-0 outline-none",
        "focus-visible:ring-0",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
};
