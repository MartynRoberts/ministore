function withProtocol(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const vercelPreview = process.env.VERCEL_URL;
  return new URL(withProtocol(configured ?? vercelProduction ?? vercelPreview ?? "http://localhost:3000")).origin;
}
