export function stripHtmlTags(str) {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '');
}
