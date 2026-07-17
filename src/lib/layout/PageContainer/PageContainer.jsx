import clsx from "clsx";

const WIDTH_CLASSES = {
  narrow: "max-w-[40rem]", // Wizard & Kunden-Detailseiten (~640 px)
  driver: "max-w-[45rem]", // Fahrer-Bereich (~720 px)
  wide: "max-w-5xl", // Landing
};

export default function PageContainer({
  width = "narrow",
  className,
  children,
}) {
  return (
    <div
      className={clsx(
        "mx-auto w-full px-4 py-6 sm:px-6 sm:py-10",
        WIDTH_CLASSES[width],
        className,
      )}
    >
      {children}
    </div>
  );
}
