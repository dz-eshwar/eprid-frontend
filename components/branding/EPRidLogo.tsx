type EPRidMarkProps = {
  size?: number;
  color?: string;
  className?: string;
};

export function EPRidMark({ size = 40, color = "#0F6E56", className }: EPRidMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="E-PRid"
    >
      <rect x="9" y="9" width="6" height="30" rx="1.5" fill={color} />
      <rect x="17" y="9" width="22" height="6.5" rx="1.5" fill={color} />
      <rect x="17" y="20.75" width="15" height="6.5" rx="1.5" fill={color} />
      <rect x="17" y="32.5" width="22" height="6.5" rx="1.5" fill={color} />
    </svg>
  );
}
