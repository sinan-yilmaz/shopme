import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderStatusPath } from "common/consts/routes";
import Button from "lib/primitives/Button";
import Dialog from "lib/primitives/Dialog";
import Input from "lib/primitives/Input";

/** Kleiner Dialog im Header: Bestellcode eingeben → Statusseite öffnen. */
export default function TrackOrderDialog({ open, onClose }) {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    onClose();
    setCode("");
    navigate(orderStatusPath(trimmed.toUpperCase()));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Bestellung verfolgen"
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        <label
          htmlFor="track-order-code"
          className="mb-1.5 block text-base font-medium text-ink"
        >
          Ihr Bestellcode
        </label>
        <Input
          id="track-order-code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="z. B. GZ-26-0001"
          autoComplete="off"
        />
        <p className="mt-1.5 text-sm text-neutral-600">
          Den Code finden Sie in Ihrer Bestellbestätigung.
        </p>
        <Button
          type="submit"
          fullWidth
          className="mt-4"
          disabled={!code.trim()}
        >
          Status anzeigen
        </Button>
      </form>
    </Dialog>
  );
}
