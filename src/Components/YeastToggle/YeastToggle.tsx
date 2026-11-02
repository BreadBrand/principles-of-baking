import { FormattedMessage, useIntl } from "react-intl";
import { YeastType } from "../../Hooks/useConvertYeast";
import "../UnitToggle/UnitToggle.css";

type YeastToggleProps = {
  yeastType: YeastType;
  onChange: () => void;
};

const YeastToggle = ({ yeastType, onChange }: YeastToggleProps) => {
  const intl = useIntl();
  return (
    <label className="toggleWrapper" aria-label={intl.formatMessage({ id: "yeastToggle.label", defaultMessage: "Switch between dry yeast and sourdough" })}>
      <span className={`toggleLabel ${yeastType === "dry" ? "toggleActive" : ""}`}><FormattedMessage id="yeastToggle.dry" defaultMessage="dry yeast" /></span>
      <div className="toggle">
        <input
          type="checkbox"
          checked={yeastType === "sourdough"}
          onChange={onChange}
        />
        <span className="slider" />
      </div>
      <span className={`toggleLabel ${yeastType === "sourdough" ? "toggleActive" : ""}`}><FormattedMessage id="yeastToggle.sourdough" defaultMessage="sourdough" /></span>
    </label>
  );
};

export default YeastToggle;
