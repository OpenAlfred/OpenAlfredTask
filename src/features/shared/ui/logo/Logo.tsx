import { twJoin } from 'tailwind-merge';
import { LogoIcon } from './LogoIcon';

interface LogoProps {
  readonly color?: 'green' | 'white';
  readonly displayText?: boolean;
  readonly height?: string;
  readonly width?: string;
}

export const Logo = ({
  color = 'green',
  height = '2rem',
  displayText = false,
  width = '2rem',
}: LogoProps) => (
  <div className="flex flex-row items-center">
    <LogoIcon
      className={color === 'green' ? 'fill-primary' : 'fill-white'}
      height={height}
      width={width}
    />
    {displayText && (
      <span
        className={twJoin(
          'ml-2 text-lg font-semibold tracking-tight',
          color === 'green' ? 'text-foreground' : 'text-white',
        )}
      >
        OpenTask
      </span>
    )}
  </div>
);
