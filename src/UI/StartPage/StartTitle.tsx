type StartTitleProps = { children: React.ReactNode };

export default function StartTitle(props: StartTitleProps) {
  const { children } = props;
  return (
    <div className="start-page">
      <p className="eyebrow">Tax Clarity</p>
      <h1>File with clarity, step by step.</h1>
      {children}
    </div>
  );
}
