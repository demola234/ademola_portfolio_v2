import { ReactNode } from "react";

interface GuestGuardProps {
  children: ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  return <>{children}</>;
}
