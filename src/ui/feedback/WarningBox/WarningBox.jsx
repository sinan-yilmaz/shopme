import { TriangleAlert } from "lucide-react";

export default function WarningBox({ title, children }) {
  return (
    <div className="flex gap-3 rounded-xl bg-warn-bg px-4 py-3.5">
      <TriangleAlert
        className="mt-0.5 size-5 shrink-0 text-warn"
        aria-hidden="true"
      />
      <div className="text-[15px] leading-relaxed text-warn [text-wrap:pretty]">
        {title && <p className="mb-1 font-bold">{title}</p>}
        {children}
      </div>
    </div>
  );
}
