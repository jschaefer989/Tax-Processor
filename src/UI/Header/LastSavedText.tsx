interface LastSavedTextProps {
  readonly lastSavedTime?: Date;
}

export default function LastSavedText(props: LastSavedTextProps) {
  const { lastSavedTime } = props;

  return (
    <div className="last-save-text">
      {lastSavedTime
        ? `Last saved ${new Date(lastSavedTime).toLocaleString()}`
        : "Not saved yet"}
    </div>
  );
}
