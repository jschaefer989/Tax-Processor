import ExclamationMarkIcon from "./ExclamationMarkIcon";

interface ErrorMessageProps {
  text: string;
}

export default function ErrorMessage(props: ErrorMessageProps) {
  const { text } = props;

  return (
    <div className="last-save-text-wrapper subtitle-chip subtitle-chip--error-soft">
      <ExclamationMarkIcon />
      {text}
    </div>
  );
}
