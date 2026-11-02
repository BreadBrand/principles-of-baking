import { FormattedMessage, useIntl } from "react-intl";
import { Unit } from "../../types/dto";
import "./UnitToggle.css";

type UnitToggleProps = {
  unit: Unit;
  onChange: () => void;
};

const UnitToggle = ({ unit, onChange }: UnitToggleProps) => {
  const intl = useIntl();
  return (
    <label className="toggleWrapper" aria-label={intl.formatMessage({ id: "unitToggle.label", defaultMessage: "Switch between grams and cups" })}>
      <span className={`toggleLabel ${unit === "g" ? "toggleActive" : ""}`}><FormattedMessage id="unitToggle.grams" defaultMessage="g" /></span>
      <div className="toggle">
        <input
          type="checkbox"
          checked={unit === "cups"}
          onChange={onChange}
        />
        <span className="slider" />
      </div>
      <span className={`toggleLabel ${unit === "cups" ? "toggleActive" : ""}`}><FormattedMessage id="unitToggle.cups" defaultMessage="cups" /></span>
    </label>
  );
};

export default UnitToggle;
