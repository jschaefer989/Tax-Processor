
interface HeaderTitleProps {
    readonly year: string;
    readonly name?: string;
}

export default function HeaderTitle(props: HeaderTitleProps) {
  const { year, name } = props;

  const subtitle = name ? name + " - " + year : year;

  return (
    <div className="title-wrapper">
      <h1 className="title">Tax Clarity</h1>
      <p className="subtitle">{subtitle}</p>
    </div>
  );
}
