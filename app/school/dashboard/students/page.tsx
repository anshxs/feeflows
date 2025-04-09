"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Student {
  id: string;
  admission_id: string;
  name: string;
  email: string;
  class: string;
  section: string;
  mob: number;
  payment_status: string;
  profile: string | null;
  cr: boolean;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [editedStudents, setEditedStudents] = useState<Record<string, Partial<Student>>>({});
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [filters, setFilters] = useState({ class: "", section: "", payment_status: "" });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [newStudent, setNewStudent] = useState<Partial<Student>>({});

  useEffect(() => {
    const session = sessionStorage.getItem("schoolSession");
    if (session) {
      const parsed = JSON.parse(session);
      setSchoolId(parsed.id);
    }
  }, []);

  useEffect(() => {
    if (schoolId) fetchCRStudents();
  }, [schoolId]);

  async function fetchCRStudents() {
    const { data, error } = await supabase.from("students").select("*").eq("sxid", schoolId).eq("cr", true);
    if (error) {
      console.error("Error fetching students:", error.message);
      return;
    }

    setStudents(data || []);
    setFilteredStudents(data || []);

    setClasses([...new Set(data.map((s) => s.class))]);
    setSections([...new Set(data.map((s) => s.section))]);
  }

  function applyFilters() {
    let filtered = students;
    if (filters.class) filtered = filtered.filter((s) => s.class === filters.class);
    if (filters.section) filtered = filtered.filter((s) => s.section === filters.section);
    if (filters.payment_status) filtered = filtered.filter((s) => s.payment_status === filters.payment_status);
    setFilteredStudents(filtered);
  }

  function handleEdit(id: string, key: keyof Student, value: any) {
    setEditedStudents((prev) => ({
      ...prev,
      [id]: { ...prev[id], [key]: value },
    }));
  }

  async function saveEdits() {
    for (const id in editedStudents) {
      await supabase.from("students").update(editedStudents[id]).eq("id", id);
    }
    fetchCRStudents();
    setEditedStudents({});
  }

  async function addStudent() {
    if (!schoolId) return;
    await supabase.from("students").insert([{ ...newStudent, sxid: schoolId, cr: true }]);
    fetchCRStudents();
  }

  return (
    <div className="px-3">
      <h1 className="text-4xl font-bold">Students</h1>
      <div className="flex justify-between items-center mt-4 mb-4">
        <div className="md:flex gap-4">
          <div className="hidden md:flex gap-4">
            <Select onValueChange={(val) => setFilters({ ...filters, class: val })}>
              <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
              <SelectContent>{classes.map((cls) => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}</SelectContent>
            </Select>
            <Select onValueChange={(val) => setFilters({ ...filters, section: val })}>
              <SelectTrigger><SelectValue placeholder="Section" /></SelectTrigger>
              <SelectContent>{sections.map((sec) => <SelectItem key={sec} value={sec}>{sec}</SelectItem>)}</SelectContent>
            </Select>
            <Button className='bg-gray-200 text-black' onClick={applyFilters}>Apply Filters</Button>
          </div>
          <Button className="bg-gray-200 text-black md:hidden" onClick={() => setIsFilterOpen(!isFilterOpen)}>Filters</Button>
          {isFilterOpen && (
            <div className="absolute border-gray-200 border-2 bg-[#f9fafa] mt-2 rounded-lg space-y-1 p-4 shadow-lg">
              <Select onValueChange={(val) => setFilters({ ...filters, class: val })}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="Class" /></SelectTrigger>
                <SelectContent>{classes.map((cls) => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}</SelectContent>
              </Select>
              <Select onValueChange={(val) => setFilters({ ...filters, section: val })}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="Section" /></SelectTrigger>
                <SelectContent>{sections.map((sec) => <SelectItem key={sec} value={sec}>{sec}</SelectItem>)}</SelectContent>
              </Select>
              <Button onClick={applyFilters}>Apply</Button>
            </div>
          )}
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className='bg-gray-200 text-black'>+ Add New</Button>
          </DialogTrigger>
          <DialogContent>
            <h2 className="text-lg font-semibold">Add New Student</h2>
            <Input placeholder="Name" onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} />
            <Input placeholder="Email" onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} />
            <Input placeholder="Admission ID" onChange={(e) => setNewStudent({ ...newStudent, admission_id: e.target.value })} />
            <Select onValueChange={(val) => setNewStudent({ ...newStudent, class: val })}>
              <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
              <SelectContent>{classes.map((cls) => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}</SelectContent>
            </Select>
            <Button onClick={addStudent}>Save</Button>
          </DialogContent>
        </Dialog>
      </div>



      <div className="overflow-auto">
        <table className="min-w-[1000px] border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">#</th>
              <th className="border p-2">Admission ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, index) => (
              <tr key={student.id} className="border">
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{student.admission_id}</td>
                <td className="border p-2">
                  <input
                    className="bg-transparent w-full"
                    defaultValue={student.name}
                    onBlur={(e) => handleEdit(student.id, "name", e.target.value)}
                  />
                </td>

                <td className="border p-2">{student.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button onClick={saveEdits}>Save Changes</Button>
      </div>
    </div>
  );
}
