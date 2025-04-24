
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

type FeeDescription = {
  title: string;
  desc: { [key: string]: number };
};
type Fee = {
  id: string;
  description: string; // raw JSON string
  student_id: string;
  school_id: string;
};

export default function FeeStructure({ studentId, schoolId }: { studentId: string; schoolId: string }) {
  const [fees, setFees] = useState<Fee[]>([]);

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
    console.log(studentId, schoolId);
  }, [studentId, schoolId]);

  if (fees.length === 0) return <p className="text-gray-500">No fee records found.</p>;

  return (
    <div className="flex flex-col gap-4">
      {fees.map((fee) => {
        let parsedArray: FeeDescription[] = [];
try {
  const parsed = JSON.parse(fee.description);
  parsedArray = Array.isArray(parsed) ? parsed : [parsed];
} catch (e) {
  console.error("Invalid JSON description");
}

        return parsedArray
          .filter((item) => item && item.title && item.desc)
          .map((entry: FeeDescription, index: number) => {
            const { title, desc } = entry;
            const total = Object.values(desc || {}).reduce((acc: number, val: number) => acc + Number(val), 0);
            return (
              <div key={`${fee.id}-${index}`} className="border rounded-2xl bg-[#f5f5f5] p-4 ">
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
                <Button
  onClick={async () => {
    // 1. Fetch student info
    const { data: studentData } = await supabase
      .from("students")
      .select("name, mob, sxid")
      .eq("id", fee.student_id)
      .single();

    if (!studentData) {
      alert("Student details not found");
      return;
    }

    // 2. Fetch school name using sxid
    const { data: schoolData } = await supabase
      .from("schools")
      .select("name")
      .eq("id", schoolId)
      .single();

    const schoolName = schoolData?.name || "Your School";

    // 3. Create Razorpay order
    const res = await fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: total,
        student_id: fee.student_id,
        description: JSON.stringify(entry),
      }),
    });

    const data = await res.json();

    // 4. Razorpay Checkout options
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: data.order.amount,
      currency: "INR",
      name: schoolName,
      description: entry.title,
      order_id: data.order.id,
      handler: async function (response: any) {
        const transaction = {
          student_id: data.student_id,
          amount_paid: data.order.amount / 100,
          platform_fee: (data.order.amount * 0.02) / 100,
          description: data.description,
          transaction_id: `txn_${Date.now()}`,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          receipt_id: data.order.receipt,
          payment_method: "online",
          currency: "INR",
          status: "success",
        };

        await fetch("/api/record-transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transaction),
        });
      },
      prefill: {
        name: studentData.name,
        email: "anshsxa@gmail.com",
        contact: studentData.mob,
      },
      theme: { color: "#3399cc" },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }}
>
  Pay Fees
</Button>

                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total:</p>
                    <p className="text-lg font-semibold">₹{total}</p>
                  </div>
                </div>
              </div>
            );
          });
      })}
    </div>
  );
}
