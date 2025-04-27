// components/ComplaintsAdmin.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";

interface Complaint {
  id: string;
  subject: string;
  description: string;
}

export default function ComplaintsAdmin() {
  const supabase = createClientComponentClient();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      const schoolSession = sessionStorage.getItem('schoolSession');
      if (!schoolSession) return;

      const { id: sxid } = JSON.parse(schoolSession);

      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('sxid', sxid);

      if (data) setComplaints(data);
    };

    fetchComplaints();
  }, []);

  const handleDelete = async () => {
    if (!selectedId) return;
    const { error } = await supabase.from('complaints').delete().eq('id', selectedId);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    toast.success("Complaint dismissed");
    setComplaints((prev) => prev.filter((c) => c.id !== selectedId));
    setOpenDialog(false);
  };

  if (complaints.length === 0) {
    return (
      <p className="text-green-500 text-center text-lg">No complaints</p>
    );
  }

  return (
    <div className="p-4 bg-yellow-100 rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center">Complaints</h2>

      <div className="flex space-x-4 overflow-x-auto">
        {complaints.map((complaint) => (
          <Card key={complaint.id} className="min-w-[250px] h-[200px] flex flex-col justify-between">
            <CardHeader className="font-semibold">{complaint.subject}</CardHeader>
            <CardContent className="text-sm">{complaint.description}</CardContent>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" onClick={() => setSelectedId(complaint.id)}>
                  Dismiss
                </Button>
              </DialogTrigger>
              <DialogContent>
                <p>Are you sure you want to dismiss this complaint?</p>
                <DialogFooter>
                  <Button onClick={handleDelete}>Yes, Dismiss</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Card>
        ))}
      </div>
    </div>
  );
}
