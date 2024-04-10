import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { ReactNode } from "react";

interface GuestGuardProps {
  children: ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const cookie = Cookies.get();
  const accessCookie = cookie?.accessToken;

  if (accessCookie) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}
