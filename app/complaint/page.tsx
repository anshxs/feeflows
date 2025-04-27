// components/ComplaintForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabase } from "@/lib/supabase"; // Make sure you're using supabase client
import { toast } from "sonner";

interface School {
  id: string;
  sxid: string;
  name: string;
}

export default function ComplaintForm() {
  
  const router = useRouter();

  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSxid, setSelectedSxid] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSchools = async () => {
      const { data, error } = await supabase.from('schools').select('id, sxid, name');
      if (data) setSchools(data);
    };
    fetchSchools();
  }, []);

  const handleSubmit = async () => {
    if (!selectedSxid || !subject || !description) {
      toast.error("Please fill all fields");
      return;
    }
    setSubmitting(true);

    const { error } = await supabase.from('complaints').insert({
      sxid: selectedSxid,
      subject,
      description
    });

    if (error) {
      toast.error("Failed to submit complaint");
      setSubmitting(false);
      return;
    }

    // Success
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      router.push("/");
    }, 2000);
  };

  return (
    <div className={`flex justify-center items-center min-h-screen ${success ? "bg-green-500" : "bg-white"} transition-all`}>
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Complaint Box</h1>

        <Select onValueChange={(value) => setSelectedSxid(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Choose School" />
          </SelectTrigger>
          <SelectContent>
            {schools.map((school) => (
              <SelectItem key={school.sxid} value={school.sxid}>
                {school.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          className="mt-4"
          placeholder="Complaint Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <Textarea
          className="mt-4"
          placeholder="Write Complaint Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Button onClick={handleSubmit} className="w-full mt-6" disabled={submitting}>
          Submit
        </Button>

        {success && (
          <div className="text-center mt-4 text-white text-lg font-semibold">
            Complaint Successfully Sent!
          </div>
        )}
      </div>
    </div>
  );
}
