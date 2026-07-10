interface AvatarProps {
  src: string;
  alt: string;
  className?: string;
}

function resolveAvatarSrc(src: string): string {
  if (/^(https?:)?\/\//.test(src) || src.startsWith("data:") || src.startsWith("blob:")) {
    return src;
  }

  const normalized = src.startsWith("/") ? src.slice(1) : src;
  const base = import.meta.env.BASE_URL;
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}${normalized}`;
}

export function Avatar({ src, alt, className }: AvatarProps) {
  return (
    <img
      src={resolveAvatarSrc(src)}
      alt={alt}
      className={`inline-block rounded-full ring-2 ring-white dark:ring-usa-slate object-cover bg-usa-smoke dark:bg-usa-slate ${className ?? ""}`}
      loading="lazy"
    />
  );
}
