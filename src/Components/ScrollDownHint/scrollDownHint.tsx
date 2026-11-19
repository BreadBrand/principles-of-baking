import { useIntl } from "react-intl";
import "./scrollDownHint.css";

type ScrollDownHintProps = {
  onClick: () => void;
};

const ScrollDownHint = ({ onClick }: ScrollDownHintProps) => {
  const intl = useIntl();

  return (
    <div className="scrollDownHintTrack">
      <button
        type="button"
        className="scrollDownHintButton"
        onClick={onClick}
        aria-label={intl.formatMessage({ id: "scrollDownHint.label", defaultMessage: "Scroll down for more" })}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
          <path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};

export default ScrollDownHint;
