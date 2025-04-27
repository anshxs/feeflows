"use client"

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface School {
  id: string;
  name: string;
  country: string;
  city: string;
  branch?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [admissionID, setAdmissionID] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchSchools() {
      const { data, error } = await supabase.from("schools").select("*");
      if (data) setSchools(data);
    }
    fetchSchools();
  }, []);

  async function handleSchoolSelect(schoolId: string) {
  const school = schools.find((s) => s.id === schoolId);
  setSelectedSchool(school || null); // Use `null` if `school` is undefined
  const { data } = await supabase.from("schools").select("branch").eq("id", schoolId);
  setBranches([...new Set(data?.map((s) => s.branch))]);
  }

  async function handleLogin() {
    setLoading(true);
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("admission_id", admissionID)
      .eq("school_id", selectedSchool?.id)
      .single();

    if (data) {
      localStorage.setItem("student", JSON.stringify(data));
      router.push(`/dashboard/${data.admission_id}`);
    } else {
      alert("Invalid Admission ID");
    }
    setLoading(false);
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f9fafa]">
        {/* Floating Logo */}
        <div className="absolute top-5 left-5">
          <Image src="/lo.png" alt="Logo" width={48} height={48} />
        </div>

        <div className="absolute top-5 right-5">
  <Button
    variant="ghost"
    className="text-black border-b bg-white"
    onClick={() => router.push("/complaint")}
  >
    Complaint Box
  </Button>
</div>

        {/* Login Form */}
        <div className="bg-[#f9fafa] rounded-lg p-6 w-96">
          <h2 className="text-xl font-semibold text-center mb-4">Login Form</h2>

          {/* School Dropdown */}
          <div className="mb-3">
            <label className="block text-sm text-gray-600">Select School</label>
            <select
              className="w-full p-2 border rounded-lg bg-[#ffffff]"
              onChange={(e) => handleSchoolSelect(e.target.value)}
            >
              <option value="">Choose...</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Dropdown */}
          {selectedSchool && (
            <div className="mb-3">
              <label className="block text-gray-600 text-sm">Select Branch</label>
              <select className="w-full p-2 border rounded-lg bg-[#ffffff]">
                <option value="">Choose...</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Country & City */}
          {selectedSchool && (
            <div className="flex gap-2 mb-3">
              <div className="w-1/2">
                <label className="block text-gray-600 text-sm">Country</label>
                <input
                  type="text"
                  value={selectedSchool.country}
                  readOnly
                  className="w-full p-2 border rounded-lg bg-[#ffffff]"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-gray-600 text-sm">City</label>
                <input
                  type="text"
                  value={selectedSchool.city}
                  readOnly
                  className="w-full p-2 border rounded-lg bg-[#ffffff]"
                />
              </div>
            </div>
          )}

          {/* Admission ID */}
          <div className="mb-4">
            <label className="block text-gray-600 text-sm">Admission ID</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg bg-[#ffffff]"
              value={admissionID}
              placeholder="ABCD-2025"
              onChange={(e) => setAdmissionID(e.target.value)}
            />
          </div>

          {/* Next Button */}
          <Button className="w-full flex items-center h-10 rounded-lg justify-center" onClick={handleLogin} disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Next"}
          </Button>
          <p className="text-sm text-gray-600 mt-2 text-center">Powered by <a className="text-blue-500">SiyaRam Inc.</a></p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-gray-300 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">About Us</h2>
              <p className="text-sm leading-relaxed text-gray-400">
                A modern solution for managing school fees efficiently. Empowering schools with seamless fee tracking and digital payments. You can register your schools with us and start managing fees online. To know more, contact us at <a href="mailto:anshsxa@gmail.com" className="text-blue-500 hover:text-blue-400 transition">anshsxa@gmail.com</a>.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Quick Links</h2>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-blue-500 hover:text-blue-400 transition">Pay Fees</Link></li>
                <li><a href="mailto:anshsxa@gmail.com" className="text-blue-500 hover:text-blue-400 transition">Contact Us</a></li>
                <li><Link href="/register" className="text-blue-500 hover:text-blue-400 transition">Register school</Link></li>
                <li><Link href="/schools" className="text-blue-500 hover:text-blue-400 transition">Registered Schools</Link></li>
                <li><Link href="/school" className="text-blue-500 hover:text-blue-400 transition">School Login</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Contact</h2>
              <ul className="text-sm space-y-2">
                <li>Email: <a href="mailto:support@schoolfees.com" className="text-blue-500 hover:text-blue-400 transition">support@schoolfees.com</a></li>
                <li>Phone: <a href="tel:+1234567890" className="text-blue-500 hover:text-blue-400 transition">+123 456 7890</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Follow Us</h2>
              <div className="flex space-x-4">
                <a href="#" className="text-blue-500 hover:text-blue-400 transition">Facebook</a>
                <a href="#" className="text-blue-500 hover:text-blue-400 transition">Twitter</a>
                <a href="#" className="text-blue-500 hover:text-blue-400 transition">Instagram</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-400 mt-10 pt-6 text-center text-sm text-gray-300">
            &copy; 2025 SiyaRam Inc.. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
