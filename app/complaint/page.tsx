"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react"; // Importing loader and check icon

interface School {
  id: string;
  sxid: string;
  name: string;
}

export default function ComplaintForm() {
  const supabase = createClientComponentClient();
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
    setTimeout(() => {
      setSuccess(true);
      setSubmitting(false);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }, 500); // a slight delay so loader spin looks natural
  };

  if (success) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-green-500 text-white transition-all">
        <CheckCircle2 className="w-20 h-20 mb-6" />
        <h1 className="text-2xl font-bold text-center">Your complaint has been successfully sent to your principal!</h1>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f9fafa]">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Complaint Box</h1>

        <Select onValueChange={(value) => setSelectedSxid(value)}>
          <SelectTrigger className="w-full p-2 border rounded-lg bg-[#ffffff]">
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
          className="w-full p-2 border mt-1 rounded-lg bg-[#ffffff]"
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
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Submit"
          )}
        </Button>
      </div>
    </div>
  );
      }
