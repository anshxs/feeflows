import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function FeeStructure({ studentId, schoolId }: { studentId: string; schoolId: string }) {
  const [fees, setFees] = useState<any[]>([]);

  useEffect(() => {
    const fetchFees = async () => {
      const { data } = await supabase
        .from("fee_structure")
        .select("*")
        .eq("student_id", studentId)
        .eq("school_id", schoolId);
      setFees(data || []);
    };
    fetchFees();
  }, [studentId, schoolId]);

  if (fees.length === 0) return <p className="text-gray-500">No fee records found.</p>;

  return (
    <div className="flex flex-col gap-4">
      {fees.map((fee) => {
        let parsedDesc = { title: "", desc: {} as Record<string, number> };
        try {
          parsedDesc = JSON.parse(fee.description);
        } catch (e) {
          console.error("Invalid JSON description");
        }

        const { title, desc } = parsedDesc;
        const total = Object.values(desc || {}).reduce((acc: number, val: any) => acc + Number(val), 0);

        return (
          <div key={fee.id} className="border rounded-2xl bg-[#f5f5f5] p-4 ">
            <h2 className="text-lg font-bold">{title}</h2>
            <div>
              {Object.entries(desc || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="capitalize text-gray-500">{key}</span>
                  <span className="text-sm text-gray-500">₹{Number(value)}</span>
                </div>
              ))}
            </div>
            <hr className="my-2 border-gray-300" />
            <div className="flex items-center justify-between">
              <Button>Pay Fees</Button>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total:</p>
                <p className="text-lg font-semibold">₹{total}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
