export function FeatureRequest() {
  const name = "jschaefer989";
  const domain = "gmail.com";
  const subject = encodeURIComponent("Feature Request for Tax Clarity");
  const body = encodeURIComponent(
    "Hello,\n\nI would like to suggest the following feature for the Tax Clarity application:\n\n[Please describe your feature request here]\n\nThank you!",
  );
  return (
    <a
      className="feature-request-link"
      href={`mailto:${name}@${domain}?subject=${subject}&body=${body}`}
    >
      Feature request
    </a>
  );
}
