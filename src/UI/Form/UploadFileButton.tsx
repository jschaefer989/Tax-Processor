import { useCallback, useState } from "react";
import type TaxResponse from "../../DataModel/TaxResponse";
import type TaxFile from "../../DataModel/TaxFile";
import FileLoaderPopup from "../General/FileLoaderPopup";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";

interface UploadFileButtonProps {
  taxBehavior: TaxBehavior;
  file: TaxFile;
  setResponses: React.Dispatch<React.SetStateAction<TaxResponse[]>>;
  setError: (error: string | undefined) => void;
  setIsLoading: (loading: boolean) => void;
}

export default function UploadFileButton(props: UploadFileButtonProps) {
  const { taxBehavior, file, setResponses, setError, setIsLoading } = props;

  const [showFileLoader, setShowFileLoader] = useState(false);

  const onClick = useCallback(() => {
    setShowFileLoader(true);
  }, []);

  const onClose = useCallback(() => {
    setShowFileLoader(false);
  }, []);

  return (
    <>
      <button className="upload-file-button" onClick={onClick}>
        Upload {file.label}
      </button>
      {showFileLoader && (
        <FileLoaderPopup
          taxBehavior={taxBehavior}
          label={file.label}
          formType={file.fromForm}
          setError={setError}
          setIsLoading={setIsLoading}
          setResponses={setResponses}
          onClose={onClose}
        />
      )}
    </>
  );
}
