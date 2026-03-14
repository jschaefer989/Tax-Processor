import { useCallback } from "react";
import type { DuplicateResponse } from "../../DataModel/DuplicateResponse";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";
import Popup from "../General/Popup";

interface DuplicateDataPopupProps {
  readonly taxBehavior: TaxBehavior;
  readonly duplicateResponses: DuplicateResponse[];
}

export function DuplicateDataPopup(props: DuplicateDataPopupProps) {
  const { taxBehavior, duplicateResponses } = props;

  const onClose = useCallback(() => {
    taxBehavior.setDuplicateResponses(undefined);
  }, []);

  const onSubmit = useCallback(() => {
    taxBehavior.setResponses((prevResponses) => {
      const updatedResponses = [...prevResponses];
      for (const duplicate of duplicateResponses) {
        const index = updatedResponses.findIndex(
          (response) =>
            response.form === duplicate.form &&
            response.label === duplicate.label &&
            response.line === duplicate.line,
        );
        if (index !== -1) {
          updatedResponses[index].value = duplicate.newValue;
        }
      }
      return updatedResponses;
    });
    onClose();
  }, [duplicateResponses]);

  return (
    <Popup
      title={"Duplicate data detected"}
      onClose={onClose}
      onSubmit={onSubmit}
      submitButtonText="Replace data"
    >
      <div className="file-input-group">
        <p className="subtitle">
          Duplicate data was found for these fields. Please confirm if you would
          like to replace this data.
        </p>
        {duplicateResponses.map((response, index) => (
          <div key={index} className="duplicate-entry">
            <h3>
              {response.getUserFriendlyForm()} &mdash;{" "}
              {response.getUserFriendlyLabel()} (line {response.line})
            </h3>
            <div className="duplicate-entry-values">
              <div className="duplicate-value">
                <span className="duplicate-value-label">Current</span>
                <span className="duplicate-value-text">
                  {response.value.trim() === "" ? "(empty)" : response.value}
                </span>
              </div>
              <span className="duplicate-arrow">&#8594;</span>
              <div className="duplicate-value">
                <span className="duplicate-value-label">New</span>
                <span className="duplicate-value-text is-new">
                  {response.newValue.trim() === "" ? "(empty)" : response.newValue}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Popup>
  );
}
