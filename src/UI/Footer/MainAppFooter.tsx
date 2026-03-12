import { FeatureRequest } from "./FeatureRequest";
import { ReturnButton } from "./ReturnButton";

export function MainAppFooter() {
  return (
    <footer>
      <ReturnButton />
      <FeatureRequest />
      <p>© 2026 Tax Clarity. All rights reserved.</p>
    </footer>
  );
}
