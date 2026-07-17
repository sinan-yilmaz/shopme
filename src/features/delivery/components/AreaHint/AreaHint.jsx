import { WarningBox } from "ui/feedback";
import { WhatsAppButton } from "ui/buttons";
import { OUTSIDE_DELIVERY_AREA_MESSAGE } from "../../consts/areas";

/** Hinweis bei PLZ außerhalb des Liefergebiets (Copy C7). */
export default function AreaHint({ zip }) {
  return (
    <WarningBox title="Noch außerhalb unseres Liefergebiets">
      <p>{OUTSIDE_DELIVERY_AREA_MESSAGE}</p>
      <div className="mt-3">
        <WhatsAppButton
          message={`Hallo! Ich wohne in PLZ ${zip} und würde gern beliefert werden. Nehmen Sie meinen Ort bald auf?`}
        >
          Per WhatsApp schreiben
        </WhatsAppButton>
      </div>
    </WarningBox>
  );
}
