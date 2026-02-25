import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import type TaxResponse from "../../DataModel/TaxResponse";
import type { TaxStep } from "../../DataModel/TaxStep";
import UploadFileButton from "./UploadFileButton";

interface FormFilesProps {
  taxBehavior: TaxBehavior;
  step: TaxStep;
  setResponses: React.Dispatch<React.SetStateAction<TaxResponse[]>>;
  setError: (error: string | undefined) => void;
  setIsLoading: (loading: boolean) => void;
}

export default function FormFiles(props: FormFilesProps) {
  const { taxBehavior, step, setResponses, setError, setIsLoading } = props;

  return (
    <div className="form-files">
      <h2 className="form-section-header">Files</h2>
      {step.files.map((file) => (
        <div key={file.label} className="form-file">
          <UploadFileButton
            taxBehavior={taxBehavior}
            file={file}
            setError={setError}
            setResponses={setResponses}
            setIsLoading={setIsLoading}
          />
        </div>
      ))}
    </div>
  );
}
