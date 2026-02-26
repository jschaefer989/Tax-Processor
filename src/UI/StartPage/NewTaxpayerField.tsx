import { useCallback } from "react";

interface NewTaxpayerFieldProps {
  setTempName: React.Dispatch<React.SetStateAction<string>>;
}

export default function NewTaxpayerField(props: NewTaxpayerFieldProps) {
  const { setTempName } = props;

  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTempName(event.target.value);
  }, []);

  return (
    <label className="field">
      <span>New taxpayer</span>
      <input
        id="new-name-input"
        type="text"
        placeholder="Enter taxpayer name"
        onChange={onChange}
      />
    </label>
  );
}
