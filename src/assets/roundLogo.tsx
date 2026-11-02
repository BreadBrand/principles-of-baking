import { useIntl } from 'react-intl';
import logo from '../assets/breadmachinelogo.svg';

type LogoProps = {
  height: string;
  width: string;
};

const RoundLogo = ({ height, width }: LogoProps) => {
  const intl = useIntl();
  return (
    <img
      src={logo}
      alt={intl.formatMessage({ id: "roundLogo.alt", defaultMessage: "Bread Machine Logo" })}
      width={width}
      height={height}
    />
  );
};

export default RoundLogo;
