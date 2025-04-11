'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { School, Users, GraduationCap, LogOut, Hand, Banknote } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const session = sessionStorage.getItem('schoolSession');
    if (!session) {
      router.push('/school');
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('schoolSession');
    router.push('/school');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-[#e9e9e9ad] text-black p-4 justify-between">
      <div>
      <div className="text-2xl font-bold mb-6">YourLogo</div>
      <nav className="space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start flex gap-2"
          onClick={() => router.push("/school/dashboard")}
        >
          <School /> School Profile
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start flex gap-2"
          onClick={() => router.push("/school/dashboard/teachers")}
        >
          <GraduationCap /> Teachers
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start flex gap-2"
          onClick={() => router.push("/school/dashboard/students")}
        >
          <Users /> Students
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start flex gap-2"
          onClick={() => router.push("/school/dashboard/students/attendance")}
        >
          <Hand /> Attendance
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start flex gap-2"
          onClick={() => router.push("/school/dashboard/money")}
        >
          <Banknote /> Fee Campaigns
        </Button>
      </nav>
    </div>

        {/* Logout Button (Only Desktop) */}
        {/* <button
          onClick={handleLogout}
          className="flex items-center gap-2 mt-6 text-red-500 hover:text-red-300"
        >
          <LogOut /> Logout
        </button> */}
        <Button
          className="w-full justify-start flex gap-2"
          onClick={handleLogout}
        >
          <LogOut /> Logout
        </Button>
      </aside>

      {/* Mobile Navbar Top */}
      <div className="md:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b p-3 flex justify-between items-center">
        <div className="text-xl font-bold">YourLogo</div>
        <button
          onClick={handleLogout}
          className="flex items-center text-red-500 hover:text-red-300"
        >
          <LogOut />
        </button>
      </div>

      {/* Bottom Navbar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#e9e9e9e7] h-12 text-black flex justify-around items-center z-50">
        <a href="/school/dashboard" className="hover:text-gray-300">
          <School />
        </a>
        <a href="/school/dashboard/teachers" className="hover:text-gray-300">
          <GraduationCap />
        </a>
        <a href="/school/dashboard/students" className="hover:text-gray-300">
          <Users />
        </a>
        <a href="/school/dashboard/students/attendance" className="hover:text-gray-300">
          <Hand />
        </a>
        <a href="/school/dashboard/money" className="hover:text-gray-300">
          <Banknote />
        </a>
        
        {/* Logout Hidden on Mobile */}
      </nav>

      <main className="flex-1 p-4 mt-2 mb-14 md:mb-0 md:mt-0">{children}</main>
    </div>
  );
}
