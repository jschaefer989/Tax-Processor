
interface BeginButtonProps {
  readonly tempName?: string;
  readonly isLoading: boolean; 
  readonly onStart: () => Promise<void>;
}

export default function BeginButton(props: BeginButtonProps) {
  const {
    tempName,
    isLoading,
    onStart,
  } = props;

  return (
    <button
      className="new-taxpayer-form-button"
      onClick={onStart}
      disabled={isLoading || tempName?.trim() === ""}
      title={isLoading ? "Server is busy. Please wait..." : ""}
    >
      Begin
    </button>
  );
}
