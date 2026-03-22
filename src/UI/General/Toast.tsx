import { useEffect } from "react";
import type { TaxBehavior } from "../../DataModel/TaxBehavior";

type ToastProps = {
  readonly toastMessage: string;
  readonly taxBehavior: TaxBehavior;
};

export default function Toast(props: ToastProps) {
  const { toastMessage, taxBehavior } = props;

  useEffect(() => {
    const timeout = setTimeout(() => {
      taxBehavior.state.setToastMessage(undefined);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [toastMessage]);

  return (
    <div className="toast" onClick={() => taxBehavior.state.setToastMessage(undefined)}>
      {toastMessage}
    </div>
  );
}
