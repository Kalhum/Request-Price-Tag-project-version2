"use client";
import { SessionProvider } from "next-auth/react";
import PasswordValidate from "@/components/PasswordValidate";

type Props = {
  children: React.ReactNode;
  session?: Parameters<typeof SessionProvider>[0]["session"];
  basePath?: string;
};

export default function AppSessionProvider({
  children,
  session,
  basePath,
}: Props) {
  return (
    <SessionProvider session={session} basePath={basePath}>
      <PasswordValidate />
      {children}
    </SessionProvider>
  );
}
