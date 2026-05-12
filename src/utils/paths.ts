export function withBase(path: string, base = "/"): string {
  const normalizedBase = base === "/" ? "/" : `${base.replace(/\/$/, "")}/`;
  const normalizedPath = path.replace(/^\//, "");

  if (normalizedBase === "/") {
    return `/${normalizedPath}`;
  }

  return `${normalizedBase}${normalizedPath}`;
}
