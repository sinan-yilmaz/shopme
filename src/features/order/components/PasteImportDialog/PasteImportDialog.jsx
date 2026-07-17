import { useState } from "react";
import Button from "lib/primitives/Button";
import Dialog from "lib/primitives/Dialog";
import Textarea from "lib/primitives/Textarea";
import { useSnackbar } from "ui/feedback";
import { useOrderDraft } from "../../context/OrderDraftProvider";
import parseShoppingList from "../../services/parseShoppingList";

/**
 * „Liste einfügen": Text einfügen, deterministisch parsen (SPEC §8.1.1),
 * Artikel an die Liste anhängen, Snackbar mit Ergebnis zeigen.
 */
export default function PasteImportDialog({ open, onClose, catalogItems }) {
  const [text, setText] = useState("");
  const { addParsedItems } = useOrderDraft();
  const showSnackbar = useSnackbar();

  const handleImport = () => {
    const parsed = parseShoppingList(text, catalogItems ?? []);
    if (!parsed.length) return;
    addParsedItems(parsed);
    showSnackbar(`${parsed.length} Artikel übernommen — bitte prüfen`);
    setText("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title="Liste einfügen" size="lg">
      <p className="mb-3 text-base text-neutral-700">
        Eine Zeile (oder ein Komma) pro Artikel. Mengen wie „2x Milch" oder „3
        Paprika" werden automatisch erkannt.
      </p>
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={8}
        placeholder={"2x Milch\nEier\nNudeln\nKlopapier\n…"}
        aria-label="Einkaufsliste als Text"
      />
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>
          Abbrechen
        </Button>
        <Button onClick={handleImport} disabled={!text.trim()}>
          Liste übernehmen
        </Button>
      </div>
    </Dialog>
  );
}
