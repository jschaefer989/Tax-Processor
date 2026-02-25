import React, { useCallback, useRef } from "react";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import type TaxResponse from "../../DataModel/TaxResponse";
import "./FileLoaderPopup.css";

interface FileLoaderPopupProps {
  taxBehavior: TaxBehavior;
  label: string;
  formType: string;
  setResponses: React.Dispatch<React.SetStateAction<TaxResponse[]>>;
  setError: (error: string | undefined) => void;
  setIsLoading: (loading: boolean) => void;
  onClose: () => void;
}

export default function FileLoaderPopup(props: FileLoaderPopupProps) {
  const { taxBehavior, label, formType, setResponses, setError, setIsLoading, onClose } = props;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TODO: factor this out into generic popup component

  const onSubmit = useCallback(async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please select a file.");
      return;
    }

    await taxBehavior.uploadTaxFile(
      file,
      formType,
      setError,
      setIsLoading,
      setResponses,
    );
    
    onClose();
  }, [formType]);

  const handleBackdropClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, []);

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Upload {label}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="file-input-group">
            <label htmlFor="file-input">Select file:</label>
            <input 
              ref={fileInputRef} 
              id="file-input" 
              type="file" 
              accept=".csv, .xml" 
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={onSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
