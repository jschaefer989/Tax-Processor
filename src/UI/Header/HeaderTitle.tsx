
interface HeaderTitleProps {
    readonly year?: string;
    readonly name?: string;
}

export default function HeaderTitle(props: HeaderTitleProps) {
  const { year, name } = props;

  return (
    <div className="title-wrapper">
      <h1 className="title">Tax Clarity</h1>
      <p className="subtitle">{getSubtitle(name, year)}</p>
    </div>
  );
}

function getSubtitle(name?: string, year?: string) {
  if (name && year) {
    return `${name} - ${year}`;
  } else if (year) {
    return year;
  } else {
    return "";
  }
}