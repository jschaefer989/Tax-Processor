import { useCallback, useRef, useState } from "react";
import type { TaxBehavior } from "../../api/TaxBehavior";
import type TaxFile from "../../data/TaxFile";
import Popup from "../General/Popup";

type UploadFileButtonProps = {
  taxBehavior: TaxBehavior;
  file: TaxFile;
};

export default function UploadFileButton(props: UploadFileButtonProps) {
  const { taxBehavior, file } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showFileLoader, setShowFileLoader] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const onClick = useCallback(() => {
    setShowFileLoader(true);
  }, []);

  const onClose = useCallback(() => {
    setShowFileLoader(false);
  }, []);

  const onSubmit = useCallback(async () => {
    const userFile = fileInputRef.current?.files?.[0];
    if (!userFile) {
      setError("Please select a file.");
      return;
    }

    await taxBehavior.uploadTaxFile(userFile, file.fromForm);

    onClose();
  }, [file.fromForm, onClose]);

  return (
    <>
      <button className="upload-file-button" onClick={onClick}>
        Upload {file.label}
      </button>
      {showFileLoader && (
        <Popup
          title={`Upload ${file.label}`}
          onClose={onClose}
          onSubmit={onSubmit}
        >
          <div className="file-input-group">
            <label htmlFor="file-input">Select file:</label>
            {error && <p className="panel__error">{error}</p>}
            <input
              ref={fileInputRef}
              id="file-input"
              type="file"
              accept=".csv, .xml"
            />
          </div>
        </Popup>
      )}
    </>
  );
}
