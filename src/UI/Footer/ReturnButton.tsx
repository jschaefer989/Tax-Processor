import { useCallback } from "react";

export function ReturnButton() {
  const onClick = useCallback(() => {
    const confirmed = window.confirm(
      "Are you sure you want to return to the start page? Any unsaved progress will be lost.",
    );
    if (confirmed) {
      window.location.reload();
    }
  }, []);

  return (
    <button className="return-button" onClick={onClick}>
      Return
    </button>
  );
}
