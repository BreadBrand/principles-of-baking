import './waveText.css';
import {CSSProperties} from 'react';

type WaveTextProps = {
  text: string;
};

type WaveCharStyle = CSSProperties & { '--i': number };

const WaveText = ({ text }: WaveTextProps) => {
  const chars = text.split('');

  return (
    <span className="wave">
      {chars.map((char, index) => (
        <span key={index} style={{ '--i': index + 1 } as WaveCharStyle}>
          {char}
          {char === ' ' && '\u00A0'}
        </span>
      ))}
    </span>
  );
}

export default WaveText;
