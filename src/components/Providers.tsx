'use client';

import { GeistProvider, CssBaseline } from '@geist-ui/core';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <GeistProvider themeType="dark">
            {children}
        </GeistProvider>
    );
}
