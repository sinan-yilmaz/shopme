import { forwardRef } from "react";
import clsx from "clsx";

const Input = forwardRef(function Input(
  { hasError = false, className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={clsx(
        "h-12 w-full rounded-lg border-[1.5px] bg-white px-3.5 text-base font-medium text-ink transition-[border-color,box-shadow] duration-150 ease-out",
        "placeholder:font-normal placeholder:text-[#9AA79F]",
        "focus:outline-none",
        "disabled:cursor-not-allowed disabled:border-field disabled:bg-[#F6F4EE] disabled:text-muted",
        hasError
          ? "border-danger focus:border-danger focus:shadow-[0_0_0_3px_#F7EBE7]"
          : "border-line-strong focus:border-brand focus:shadow-[0_0_0_3px_#E7F1EA]",
        className,
      )}
      {...rest}
    />
  );
});

export default Input;
