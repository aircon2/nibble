import { Auth0Provider } from '@auth0/auth0-react';
import type { PropsWithChildren } from 'react';

const callbackUrl = 'http://localhost:8081/';
const audience = process.env.EXPO_PUBLIC_AUTH0_AUDIENCE;

export function AuthProvider({ children }: PropsWithChildren) {
  return (
    <Auth0Provider
      domain="dev-dxogssw5moaoghyl.us.auth0.com"
      clientId="QuqsVlN0w5zkZZxNipwCDf7xoiuuCXiJ"
      authorizationParams={{ redirect_uri: callbackUrl, ...(audience ? { audience } : {}) }}
    >
      {children}
    </Auth0Provider>
  );
}
