import { Auth0Provider } from '@auth0/auth0-react';
import type { PropsWithChildren } from 'react';

const callbackUrl = 'http://localhost:8081/';

export function AuthProvider({ children }: PropsWithChildren) {
  return (
    <Auth0Provider
      domain="dev-dxogssw5moaoghyl.us.auth0.com"
      clientId="QuqsVlN0w5zkZZxNipwCDf7xoiuuCXiJ"
      authorizationParams={{ redirect_uri: callbackUrl }}
    >
      {children}
    </Auth0Provider>
  );
}
