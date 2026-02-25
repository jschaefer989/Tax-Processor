import type TaxResponse from "../../DataModel/TaxResponse";
import FormValueField from "./FormValueField";

interface FormSectionProps {
    title?: string;
    responses: TaxResponse[];
}

export default function FormSection(props: FormSectionProps) {
    const { title, responses } = props;

    return (
        <div className="sidebar-card">
            {title && <h3>{title}</h3>}
            {responses.map((response, index) => (
                <FormValueField key={index} response={response} />
            ))}
        </div>
    )
}