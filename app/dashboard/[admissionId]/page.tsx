// app/dashboard/[admissionId]/page.tsx
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

export default async function Page({ params }: { params: { admissionId: string } }) {
  const admId = await params.admissionId;

  const { data: student } = await supabase
    .from("students")
    .select("*, schools(*)")
    .eq("admission_id", admId)
    .single();

  return <Dashboard student={student} />;
}
