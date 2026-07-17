import { Link } from "react-router-dom";
import routes from "common/consts/routes";
import PageContainer from "lib/layout/PageContainer";
import { buttonClasses } from "lib/primitives/Button";
import { LostCar } from "ui/illustrations";

export default function NotFoundPage() {
  return (
    <PageContainer className="animate-step-in">
      <div className="mx-auto max-w-[480px] px-1 py-9 text-center">
        <LostCar className="mx-auto block" />
        <h1 className="mt-[22px] font-display text-[30px] font-extrabold leading-[1.15] text-ink">
          Diese Seite gibt es nicht
        </h1>
        <p className="mx-auto mt-2.5 max-w-[38ch] text-[16.5px] text-muted [text-wrap:pretty]">
          Da sind wir wohl falsch abgebogen. Zurück zur Startseite — dort geht's
          zu Ihrem Einkauf.
        </p>
        <Link
          to={routes.home}
          className={`${buttonClasses({ size: "lg" })} mt-[22px]`}
        >
          Zur Startseite
        </Link>
      </div>
    </PageContainer>
  );
}
