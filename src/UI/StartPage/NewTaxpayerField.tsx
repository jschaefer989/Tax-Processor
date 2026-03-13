import { useCallback } from "react";

interface NewTaxpayerFieldProps {
  setTempName: React.Dispatch<React.SetStateAction<string>>;
  onStart: () => Promise<void>;
}

export default function NewTaxpayerField(props: NewTaxpayerFieldProps) {
  const { setTempName, onStart } = props;

  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTempName(event.target.value);
  }, []);

  const onKeyUp = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onStart();
    }
  }, [onStart]);

  return (
    <label className="field">
      <input
        id="new-name-input"
        type="text"
        placeholder="Enter taxpayer name"
        onChange={onChange}
        onKeyUp={onKeyUp}
      />
    </label>
  );
}
