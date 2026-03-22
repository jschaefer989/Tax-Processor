import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import type { TaxStep } from "../../DataModel/TaxStep";
import UploadFileButton from "./UploadFileButton";

type FormFilesProps = {
  taxBehavior: TaxBehavior;
  step: TaxStep;
}

export default function FormFiles(props: FormFilesProps) {
  const { taxBehavior, step } = props;

  return (
    <div className="form-files">
      <h3 className="form-section-header">Files</h3>
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
