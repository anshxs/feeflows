"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/lib/supabase'

type MagicLink = {
  id: string;
  magic_pass: string;
  class: string;
  section: string;
  school_id: string;
};

export default function MagicAttendance() {
  const [open, setOpen] = useState(false);
  const [magicPass, setMagicPass] = useState("");
  const [magicClass, setMagicClass] = useState("");
  const [section, setSection] = useState("");
  const [selectedMagicId, setSelectedMagicId] = useState<string | null>(null);
  const [magicLinks, setMagicLinks] = useState<MagicLink[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);

  const domain = "https://yourdomain.com"; // Replace with actual domain

  const loadMagicLinks = async (schoolId: string) => {
    const { data, error } = await supabase
      .from("magic_attendance")
      .select("*")
      .eq("school_id", schoolId);

    if (!error && data) {
      setMagicLinks(data);
    }
  };

  const loadStudentClassSection = async (schoolId: string) => {
    const { data, error } = await supabase
      .from("students")
      .select("class, section")
      .eq("sxid", schoolId);

    if (!error && data) {
      const uniqueClasses = [...new Set(data.map((d) => d.class))].filter(Boolean);
      const uniqueSections = [...new Set(data.map((d) => d.section))].filter(Boolean);
      setClasses(uniqueClasses);
      setSections(uniqueSections);
    }
  };

  useEffect(() => {
    const sessionStr = sessionStorage.getItem("schoolSession");
    if (!sessionStr) return;

    const session = JSON.parse(sessionStr);
    const schoolId = session?.id;

    if (!schoolId) return;

    loadMagicLinks(schoolId);
    loadStudentClassSection(schoolId);
  }, []);

  const handleCreateOrUpdate = async () => {
    const sessionStr = sessionStorage.getItem("schoolSession");
    if (!sessionStr) return alert("Missing session");

    const session = JSON.parse(sessionStr);
    const { username, password, id: schoolIdFromSession } = session;

    const { data: authUser, error: authError } = await supabase
      .from("school_auth")
      .select("id")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (authError || !authUser) {
      alert("Authentication failed");
      return;
    }

    const payload = {
      magic_pass: magicPass,
      class: magicClass,
      section,
      school_id: schoolIdFromSession,
    };

    if (selectedMagicId) {
      await supabase.from("magic_attendance").update(payload).eq("id", selectedMagicId);
    } else {
      await supabase.from("magic_attendance").insert(payload);
    }

    setOpen(false);
    resetForm();
    loadMagicLinks(schoolIdFromSession);
  };

  const handleEdit = (link: MagicLink) => {
    setSelectedMagicId(link.id);
    setMagicPass(link.magic_pass);
    setMagicClass(link.class);
    setSection(link.section);
    setOpen(true);
  };

  const resetForm = () => {
    setMagicPass("");
    setMagicClass("");
    setSection("");
    setSelectedMagicId(null);
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Copied!");
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Magic Attendance</h1>
        <Button variant="outline" onClick={() => setOpen(true)}>
          + Create Link
        </Button>
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={(o) => {
        if (!o) resetForm();
        setOpen(o);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedMagicId ? "Edit Magic Link" : "Create Magic Link"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input placeholder="Magic Passcode" value={magicPass} onChange={(e) => setMagicPass(e.target.value)} />
<div className="flex gap-2">
            <Select value={magicClass} onValueChange={setMagicClass}>
              <SelectTrigger className="w-1/2">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={section} onValueChange={setSection}>
              <SelectTrigger className="w-1/2">
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((sec) => (
                  <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                ))}
              </SelectContent>
            </Select></div>

            {selectedMagicId && (
              <div className="flex items-center gap-2">
                <Input className="text-blue-500 cursor-pointer" disabled value={`${domain}/magic/${selectedMagicId}`} />
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(`${domain}/magic/${selectedMagicId}`)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            )}

            <Button onClick={handleCreateOrUpdate}>
              {selectedMagicId ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Existing Links */}
      <div className="flex flex-row overflow-x-auto gap-4 whitespace-nowrap p-2">
        {magicLinks.map((link) => (
          <Card key={link.id} onClick={() => handleEdit(link)} className="bg-[#e9e9e9ad] cursor-pointer hover:shadow-md transition inline-block min-w-[250px] ">
            <CardContent >
              <div><strong>Class:</strong> {link.class}</div>
              <div><strong>Section:</strong> {link.section}</div>
              <div><strong>Passcode:</strong> {link.magic_pass}</div>
              <p className="text-[12px] text-gray-500">Click to see Magic Attendance Link</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
