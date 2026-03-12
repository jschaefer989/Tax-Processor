import { useEffect } from "react";

interface ToastProps {
  readonly toastMessage: string;
  readonly setToastMessage: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export default function Toast(props: ToastProps) {
  const { toastMessage, setToastMessage } = props;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setToastMessage(undefined);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [toastMessage]);

  return (
    <div className="toast" onClick={() => setToastMessage(undefined)}>
      {toastMessage}
    </div>
  );
}
