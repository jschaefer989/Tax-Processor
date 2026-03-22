import React, { useCallback } from "react";

type Popup = {
  title: string;
  children: React.ReactNode;
  onSubmit: () => void
  onClose: () => void;
  submitButtonText?: string;
};

export default function Popup(props: Popup) {
  const { title, onClose, onSubmit, submitButtonText, children } = props;

  const handleBackdropClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={onSubmit}>
            {submitButtonText ?? "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
