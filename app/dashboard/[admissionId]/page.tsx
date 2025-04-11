// app/dashboard/[admissionId]/page.tsx
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import {FC} from 'react'
import { supabase } from "@/lib/supabase";

interface PageProps {
  params: {
    admissionId: string;
  }
}

const Dashboard = dynamic(() => import("../../../components/Dashboard"), {
  loading: () => (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
    </div>
  ),
});

const Page: FC<PageProps> = async ({ params }) => {
  const {admissionId} = await params;

  const { data: student, error } = await supabase
  .from("students")
  .select("*, schools!students_school_id_fkey(*)")  // Explicitly specify the relationship
  .eq("admission_id", admissionId)
  .single();

if (error || !student) {
  return <div>Error loading student data</div>;
}

return <Dashboard student={student} />;
}

export default Page;