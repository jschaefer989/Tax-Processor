import { useCallback } from "react";
import type TaxResponse from "../../DataModel/TaxResponse";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";

type FormValueProps = {
    readonly taxBehavior: TaxBehavior;
    readonly response: TaxResponse;
};

export function FormValue(props: FormValueProps) {
    const { taxBehavior, response } = props;
    
    const onClick = useCallback(() => {
        navigator.clipboard.writeText(response.value).then(() => {
            taxBehavior.state.setToastMessage("Value copied to clipboard!");
        }).catch((err) => {
            console.error("Failed to copy text: ", err);
        });
    }, [response.value]);

    return (
        <span className="form-value" onClick={onClick}>{response.value}</span>
    );
}