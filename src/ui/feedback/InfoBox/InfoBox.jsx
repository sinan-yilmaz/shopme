import { Info } from "lucide-react";

export default function InfoBox({ title, children }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-brand-soft px-4 py-[15px]">
      <Info
        className="mt-0.5 size-[21px] shrink-0 text-brand-deep"
        aria-hidden="true"
      />
      <div className="text-[15px] leading-relaxed text-brand-deep [text-wrap:pretty]">
        {title && <p className="mb-1 font-bold">{title}</p>}
        {children}
      </div>
    </div>
  );
}
