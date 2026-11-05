import { LogoIcon } from './LogoIcon';

interface LogoProps {
  readonly displayText?: boolean;
  readonly height?: string;
  readonly width?: string;
}

export const Logo = ({ height = '2rem', displayText = false, width = '2rem' }: LogoProps) => (
  <div className="flex flex-row items-center">
    <LogoIcon height={height} width={width} />
    {displayText && (
      <span className="ml-2 text-lg font-semibold tracking-tight text-foreground">OpenAlfred</span>
    )}
  </div>
);
