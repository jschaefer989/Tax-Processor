import { useState } from "react";
import type TaxResponse from "../../data/TaxResponse";
import ExpandButton from "../General/ExpandButton";
import Form1040 from "./Form1040";
import Form8949 from "./Form8949";
import type { TaxBehavior } from "../../api/TaxBehavior";
import RestartButton from "../Header/RestartButton";
import ScheduleD from "./ScheduleD";

type FileSidebarProps = {
  readonly taxBehavior: TaxBehavior;
  readonly responses: TaxResponse[];
  readonly isExpanded: boolean;
  readonly year: number;
  readonly name: string;
  readonly isLoading: boolean;
};

export default function FileSidebar(props: FileSidebarProps) {
  const {
    taxBehavior,
    responses,
    isExpanded,
    year,
    name,
    isLoading,
  } = props;

  const [allSectionsExpanded, setAllSectionsExpanded] = useState<boolean | undefined>(undefined);

  const skippedResponses = responses.filter((response) => !response.isSkip());

  const form1040Responses = skippedResponses.filter(
    (response) => response.form === "Form1040",
  );

  const form8949Page1Responses = skippedResponses.filter(
    (response) => response.form === "Form8949Page1",
  );

  const form8949Page2Responses = skippedResponses.filter(
    (response) => response.form === "Form8949Page2",
  );

  return (
    <div className="sidebar-container">
      <div
        className={`sidebar-panel ${isExpanded ? "sidebar-panel--open" : "sidebar-panel--closed"}`}
      >
        <div className="panel__header">
          <div>
            <div className="sidebar-title-row">
              <h2 style={{ marginTop: 0 }}>Tax form data</h2>
              <RestartButton
                taxBehavior={taxBehavior}
                responses={responses}
                year={year}
                name={name}
                isLoading={isLoading}
              />
              <ExpandButton
                expanded={allSectionsExpanded ?? false}
                setExpanded={setAllSectionsExpanded}
                title={
                  allSectionsExpanded
                    ? "Collapse all sections"
                    : "Expand all sections"
                }
                direction="down"
                inline={true}
              />
            </div>
            <p>Review the data to be entered in your tax forms.</p>
            <br />
            {form1040Responses.length === 0 &&
              form8949Page1Responses.length === 0 &&
              form8949Page2Responses.length === 0 && (
                <i>Tax form data will appear here.</i>
              )}
            <Form1040
              taxBehavior={taxBehavior}
              responses={form1040Responses}
              isExpandedOverride={allSectionsExpanded}
            />
            <Form8949
              taxBehavior={taxBehavior}
              title="Form 8949 - Page 1"
              form="Form8949Page1"
              responses={form8949Page1Responses}
              isExpandedOverride={allSectionsExpanded}
            />
            <Form8949
              taxBehavior={taxBehavior}
              title="Form 8949 - Page 2"
              form="Form8949Page2"
              responses={form8949Page2Responses}
              isExpandedOverride={allSectionsExpanded}
            />
            <ScheduleD
              taxBehavior={taxBehavior}
              title="Schedule D"
              form="ScheduleD"
              responses={skippedResponses.filter((response) => response.form === "ScheduleD")}
              isExpandedOverride={allSectionsExpanded}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
