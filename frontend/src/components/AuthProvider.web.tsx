import { Auth0Provider } from '@auth0/auth0-react';
import type { PropsWithChildren } from 'react';

const callbackUrl = typeof window === 'undefined' ? 'http://localhost:8081/' : `${window.location.origin}/`;
const audience = process.env.EXPO_PUBLIC_AUTH0_AUDIENCE || 'https://nibble-api';
const domain = process.env.EXPO_PUBLIC_AUTH0_DOMAIN || 'dev-dxogssw5moaoghyl.us.auth0.com';
const clientId = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID || 'QuqsVlN0w5zkZZxNipwCDf7xoiuuCXiJ';

export function AuthProvider({ children }: PropsWithChildren) {
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: callbackUrl, ...(audience ? { audience } : {}) }}
    >
      {children}
    </Auth0Provider>
  );
}
