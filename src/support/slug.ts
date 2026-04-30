export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugifyComponents(components: string[], fallback = "item"): string {
  const slug = slugify(
    components
      .map((component) => component.trim())
      .filter((component) => component.length > 0)
      .join(" ")
  );

  return slug.length > 0 ? slug : fallback;
}
