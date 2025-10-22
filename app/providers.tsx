"use client";

import {TurnkeyProvider, TurnkeyProviderConfig} from "@turnkey/react-wallet-kit";

const turnkeyConfig: TurnkeyProviderConfig = {
    organizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID!,
    authProxyConfigId: process.env.NEXT_PUBLIC_AUTH_PROXY_CONFIG_ID!,
};

export function Providers({ children }: { children: React.ReactNode }) {
    return <TurnkeyProvider
        config={turnkeyConfig}
        callbacks={{
            onAuthenticationSuccess: ({ session }) => {
                console.log("User authenticated:", session);
            },
            onError: (error) => console.error("Turnkey error:", error),
        }}
    >{children}</TurnkeyProvider>;
}
