import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import BackToTop from "../../components/BackToTop";
// import Footer from "./Footer";

interface GuestLayoutProps {
  children?: React.ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
  return (
    <div className="text-white bg-black container mx-auto xl:px-[0px] px-[20px]">
      <Navbar />
      {children ? children : <Outlet />}
      <BackToTop />
    </div>
  );
}
