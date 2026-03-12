import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import type { TaxStep } from "../../DataModel/TaxStep";
import UploadFileButton from "./UploadFileButton";

interface FormFilesProps {
  taxBehavior: TaxBehavior;
  step: TaxStep;
}

export default function FormFiles(props: FormFilesProps) {
  const { taxBehavior, step } = props;

  return (
    <div className="form-files">
      <h2 className="form-section-header">Files</h2>
      {step.files.map((file) => (
        <div key={file.label} className="form-file">
          <UploadFileButton
            taxBehavior={taxBehavior}
            file={file}
          />
        </div>
      ))}
    </div>
  );
}
