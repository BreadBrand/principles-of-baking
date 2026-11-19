import { useId } from "react";
import { useIntl } from "react-intl";
import { SYMBOLS } from "../../Constants/untranslated";
import { toTotalMinutes, type DurationFields } from "../../Utility/recipeDuration";
import "./durationInput.css";

type DurationInputProps = {
  label: string;
  value: DurationFields;
  onChange: (value: DurationFields) => void;
};

const DurationInput = ({ label, value, onChange }: DurationInputProps) => {
  const intl = useIntl();
  const labelId = useId();
  const invalid = toTotalMinutes(value) === null;
  const inputClass = `editInput durationNumber${invalid ? " durationInvalid" : ""}`;

  return (
    <div className="durationInput" role="group" aria-labelledby={labelId}>
      <span id={labelId} className="durationLabel">{label}</span>
      <div className="durationFields">
        <input
          type="text"
          inputMode="numeric"
          className={inputClass}
          value={value.hours}
          onChange={e => onChange({ ...value, hours: e.target.value })}
          placeholder={SYMBOLS.zeroPlaceholder}
          aria-invalid={invalid}
          aria-label={intl.formatMessage({ id: "durationInput.hours", defaultMessage: "{label}, hours" }, { label })}
        />
        <span className="durationUnit">{intl.formatMessage({ id: "durationInput.hoursUnit", defaultMessage: "h" })}</span>
        <input
          type="text"
          inputMode="numeric"
          className={inputClass}
          value={value.minutes}
          onChange={e => onChange({ ...value, minutes: e.target.value })}
          placeholder={SYMBOLS.zeroPlaceholder}
          aria-invalid={invalid}
          aria-label={intl.formatMessage({ id: "durationInput.minutes", defaultMessage: "{label}, minutes" }, { label })}
        />
        <span className="durationUnit">{intl.formatMessage({ id: "durationInput.minutesUnit", defaultMessage: "min" })}</span>
      </div>
    </div>
  );
};

export default DurationInput;
