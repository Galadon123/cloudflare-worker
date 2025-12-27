export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateUniqueId = (name: string, suffix?: string): string => {
  const slug = generateSlug(name);
  return suffix ? `${slug}-${suffix}` : slug;
};