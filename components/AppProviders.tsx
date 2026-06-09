"use client";

import AppVideoShell from "./AppVideoShell";
import LanguageSwitch from "./LanguageSwitch";
import { LanguageProvider } from "./LanguageProvider";

export default function AppProviders({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <AppVideoShell>
        <LanguageSwitch />
        {children}
      </AppVideoShell>
    </LanguageProvider>
  );
}
