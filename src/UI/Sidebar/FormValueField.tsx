import type TaxResponse from "../../DataModel/TaxResponse";

interface FormValueFieldProps {
    response: TaxResponse
}

export default function FormValueField(props: FormValueFieldProps) {
    const { response } = props;

    if (response.value.trim() === "") {
        return null;
    } 

    return (
        <div className="form-value-field">
            <span className="form-value-label">{response.getUserFriendlyLabel()}</span>
            <span className="form-value">{response.value}</span>
        </div>
    )
}