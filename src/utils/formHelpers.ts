export function shouldShowError(
  touched: Record<string, boolean>,
  field: string,
  message?: string,
): boolean {
  return Boolean(touched[field] && message);
}
