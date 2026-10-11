export default function Icon({ icon, size = 20, strokeWidth = 1.6, className = '' }) {
  if (!icon) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {icon.map(([tag, attrs], i) => {
        const Tag = tag;
        const { key: _key, strokeWidth: sw, ...rest } = attrs;
        return <Tag key={i} {...rest} strokeWidth={sw || strokeWidth} />;
      })}
    </svg>
  );
}
