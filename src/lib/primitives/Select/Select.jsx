import { forwardRef } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(function Select(
  { hasError = false, className, children, ...rest },
  ref,
) {
  return (
    <span className={clsx("relative inline-flex w-full", className)}>
      <select
        ref={ref}
        className={clsx(
          "h-12 w-full cursor-pointer appearance-none rounded-lg border bg-white pl-4 pr-11 text-lg text-ink transition-colors duration-150 ease-out",
          "focus:outline-none focus:ring-2 focus:ring-offset-0",
          "disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500",
          hasError
            ? "border-warn-600 focus:border-warn-600 focus:ring-warn-500"
            : "border-neutral-300 hover:border-neutral-400 focus:border-brand-600 focus:ring-brand-600",
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-neutral-500"
        aria-hidden="true"
      />
    </span>
  );
});

export default Select;
