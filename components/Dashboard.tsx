"use client";

import Image from "next/image";
import FeeStructure from "./FeeStructure";

export default function Dashboard({ student }: { student: any }) {
  const placeholder = "/lo.png";

  if (!student) {
    return <div>Loading...</div>; // or some other fallback UI while student is loading
  }

  const profileImage = student?.profile || placeholder;
  const school = student?.schools;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 border-b pb-4 mb-4">
        <Image
          src="/lo.png"
          alt="Website Logo"
          width={50}
          height={50}
        />
        <span className="text-xl font-semibold">×</span>
        {school?.image ? (
          <Image
            src={school.image}
            alt="School Logo"
            width={50}
            height={50}
          />
        ) : (
          <Image
            src={placeholder}
            alt="Placeholder"
            width={50}
            height={50}
          />
        )}
      </div>

      {/* Student Profile */}
      <div className="flex items-center gap-6 mb-6 p-6 bg-[#e9e9e9ad] rounded-2xl border">
        <Image
          src={profileImage}
          alt="Student Profile"
          width={80}
          height={80}
          className="rounded-full object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold">{student?.name}</h2>
          <p className="text-gray-600 text-sm">{student?.admission_id}</p>
          <p className="text-gray-600 text-sm">{school?.name} - {school?.branch}</p>
          
          <p className="text-gray-600 text-sm">Class: {student?.class} - {student?.section}</p>
          {student?.email && (
            <p className="text-blue-400 text-sm">{student?.email}</p>
          )}
          <p className={`text-sm text-gray-600`}>
            Payment Status: <a className ={`font-semibold ${student?.payment_status === "paid" ? "text-green-600" : "text-red-400"}`}>{student?.payment_status?.toUpperCase()}</a>
          </p>
        </div>
      </div>

      {/* Due Fees */}
      <h3 className="text-xl font-semibold mb-2">Due Fees</h3>
      {student?.payment_status === "paid" ? (
        <p className="text-green-700 font-medium">No Due Fees 🎉</p>
      ) : (
        <div>
          {/* Fetch fee_structure dynamically on client side */}
          {/* console.log(student.id, student.school_id); */}
          <FeeStructure studentId={student.id} schoolId={student.school_id} />
        </div>
      )}
    </div>
  );
}
