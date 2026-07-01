export function getPublicUrl(
  slug: string, 
  customDomain?: string | null, 
  isRoot: boolean = false, 
  includeProtocol: boolean = true
): string {
  const baseProtocol = process.env.NODE_ENV === 'development' ? 'http://' : 'https://';
  const prefix = includeProtocol ? baseProtocol : '';

  if (customDomain) {
    if (isRoot) {
      return `${prefix}${customDomain}`;
    } else {
      return `${prefix}${customDomain}/${slug}`;
    }
  }

  return `${prefix}plataformashop.com.br/${slug}`;
}
