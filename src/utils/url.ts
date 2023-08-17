export function interpolateUrlTemplate(
  template: string,
  params: { [key: string]: string }
): string {
  let interpolatedUrl = template;

  for (const param in params) {
    const paramPlaceholder = ":" + param;
    interpolatedUrl = interpolatedUrl.replace(paramPlaceholder, params[param]);
  }

  return interpolatedUrl;
}
