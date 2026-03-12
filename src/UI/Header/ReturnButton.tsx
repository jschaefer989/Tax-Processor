import { useCallback } from "react";

interface ReturnButtonProps {
  isLoading: boolean;
}

export function ReturnButton(props: ReturnButtonProps) {
  const { isLoading } = props;

  const onClick = useCallback(() => {
    const confirmed = window.confirm(
      "Are you sure you want to return to the start page? Any unsaved progress will be lost.",
    );
    if (confirmed) {
      window.location.reload();
    }
  }, []);

  return (
    <button
      className="ghost"
      onClick={onClick}
      disabled={isLoading}
      title={
        isLoading ? "Server is busy. Please wait..." : "Return to start page"
      }
    >
      Return
    </button>
  );
}
