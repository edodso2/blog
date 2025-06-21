import { headers } from 'next/headers';
import 'server-only';

export const getConfig = async () => {
  const headersList = await headers();
  const host = headersList.get('host');

  // Extract subdomain
  const subdomain = host?.split('.')[0] || 'default';

  console.log('🔍 Host:', host, 'Subdomain:', subdomain);

  // Fetch configuration
  const response = await fetch(
    `http://localhost:3004/config?subdomain=${subdomain}`,
    {
      cache: 'force-cache',
      next: { revalidate: 3600 }, // cache for 1 hour
    }
  );

  return response.json();
};
