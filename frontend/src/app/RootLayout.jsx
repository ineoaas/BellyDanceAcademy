import { Outlet, ScrollRestoration } from "react-router";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <AnnouncementBanner />
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
