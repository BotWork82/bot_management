import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../../lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

// Accept className and children; do not pass className to Radix Portal props
const DialogPortal = ({ className, children, ...props }: any) => (
  <DialogPrimitive.Portal {...props}>
    <div className={cn(className as string)}>{children}</div>
  </DialogPrimitive.Portal>
);
DialogPortal.displayName = DialogPrimitive.Portal.displayName;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  // Normalize children into header / body / footer so the body can scroll when content is long
  const items = React.Children.toArray(children);
  const header = items.length > 0 ? items[0] : null;
  const footer = items.length > 1 ? items[items.length - 1] : null;
  const body =
    items.length > 2
      ? items.slice(1, items.length - 1)
      : items.length === 2
      ? []
      : items.slice(1);

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          // allow page provided className first
          className,
          // center dialog, limit height and hide overflow; use grid rows: header auto, body flex (scroll), footer auto
          "fixed left-1/2 top-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-0 shadow-2xl duration-200 rounded-2xl",
          // limit height a bit more on small screens so dialogs don't feel full-screen
          "grid-rows-[auto_1fr_auto] max-h-[85vh] sm:max-h-[90vh] overflow-hidden",
          // Enforce max-width at the end so page classes like max-w-full can't override mobile margins
          "!max-w-[88vw] sm:!max-w-3xl mx-auto",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
        )}
        {...props}
      >
        {/* Header (keeps its own padding) */}
        {header}

        {/* Body area: scrollable when content is tall. Don't inject extra padding; pages often include their own. */}
        <div className="overflow-y-auto min-h-0">{body}</div>

        {/* Footer */}
        {footer}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-left px-4 sm:px-8 pt-5 pb-3 border-b",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-xs text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center justify-end gap-3 px-4 sm:px-8 py-4 border-t bg-slate-50 rounded-b-2xl",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogClose = DialogPrimitive.Close;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose
};
