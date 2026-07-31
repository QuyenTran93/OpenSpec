const BLOCKED_ELEMENTS = /<(script|iframe|object|embed|link|meta|base|form)\b[^>]*>[\s\S]*?<\/\1\s*>|<(script|iframe|object|embed|link|meta|base|form)\b[^>]*\/?>/gi;

export function sanitizeVisualFragment(input: string): string {
  return input
    .replace(BLOCKED_ELEMENTS, '')
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+(href|src)\s*=\s*(["'])\s*(?:javascript:|data:text\/html|https?:\/\/)[\s\S]*?\2/gi, '')
    .replace(/<!doctype[^>]*>|<\/?(?:html|head|body)\b[^>]*>/gi, '');
}
