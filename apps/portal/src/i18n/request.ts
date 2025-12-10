import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const supportedLocales = ['en', 'vi'] as const;

export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get('NEXT_LOCALE')?.value || 'en';
  // Validate locale is supported, fallback to 'en' if not
  const locale = supportedLocales.includes(cookieLocale as any)
    ? cookieLocale
    : 'en';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
