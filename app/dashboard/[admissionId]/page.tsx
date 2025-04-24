import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";

const Dashboard = dynamic(() => import("../../../components/Dashboard"), {
  loading: () => (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
    </div>
  ),
});

export default async function Page({ params }: { params: Promise<{ admissionId: string }> }) {
  const resolvedParams = await params;
  const { admissionId } = resolvedParams;

  const { data: student, error } = await supabase
    .from("students")
    .select("*, schools!students_school_id_fkey(*)")
    .eq("admission_id", admissionId)
    .single();

  if (error || !student) {
    return <div>Error loading student data</div>;
  }

  return <Dashboard student={student} />;
}
