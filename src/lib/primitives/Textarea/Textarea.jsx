import { forwardRef } from "react";
import clsx from "clsx";

const Textarea = forwardRef(function Textarea(
  { hasError = false, className, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={clsx(
        "w-full rounded-lg border bg-white px-4 py-3 text-lg text-ink transition-colors duration-150 ease-out",
        "placeholder:text-neutral-400",
        "focus:outline-none focus:ring-2 focus:ring-offset-0",
        "disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500",
        hasError
          ? "border-warn-600 focus:border-warn-600 focus:ring-warn-500"
          : "border-neutral-300 hover:border-neutral-400 focus:border-brand-600 focus:ring-brand-600",
        className,
      )}
      {...rest}
    />
  );
});

export default Textarea;
