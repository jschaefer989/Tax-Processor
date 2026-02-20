interface ToastProps {
  readonly toastMessage: string;
}

export default function Toast(props: ToastProps) {
  const { toastMessage } = props;

  return (
    <div className="toast">
      {toastMessage}
    </div>
  );
}
