import { Navbar } from "@/components/layout/Navbar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { BottomNav } from "@/components/layout/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MobileHeader />
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <BottomNav />
    </>
  );
}
