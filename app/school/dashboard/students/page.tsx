"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Edit3Icon, TrashIcon } from "lucide-react";


interface Student {
  id: string;
  admission_id: string;
  name: string;
  class: string;
  section: string;
  mob: number;
  payment_status: string;
  profile: string;
  cr: boolean;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    class: "",
    section: "",
    payment_status: "",
    cr: false,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [newStudent, setNewStudent] = useState<Partial<Student>>({});
  const [editStudent, setEditStudent] = useState<Partial<Student>>({});
  const [deleteStudentId, setDeleteStudentId] = useState<string | null>(null);

  useEffect(() => {
    const session = sessionStorage.getItem("schoolSession");
    if (session) {
      const parsed = JSON.parse(session);
      setSchoolId(parsed.id);
    }
  }, []);

  useEffect(() => {
    if (schoolId) fetchStudents();
  }, [schoolId]);

  async function fetchStudents() {
    const { data, error } = await supabase.from("students").select("*").eq("sxid", schoolId);
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
    if (filters.cr) filtered = filtered.filter((s) => s.cr === filters.cr);
    setFilteredStudents(filtered);
  }

  async function addStudent() {
    if (!schoolId) return;
    await supabase.from("students").insert([{ ...newStudent, sxid: schoolId, cr: false }]);
    fetchStudents();
    console.log("Student added successfully:", newStudent,schoolId, false);
    setNewStudent({});
  }

  async function updateStudent() {
    if (editStudent.id) {
      try {
        // Wait for the update to complete
        const { data, error } = await supabase
          .from("students")
          .update(editStudent)
          .eq("id", editStudent.id);

        if (error) {
          throw new Error(error.message);
        }

        // Wait for the fetchStudents to complete if it's async
        await fetchStudents();

        console.log('Student updated successfully:', data);
      } catch (error) {
        console.error('Error updating student:', error);
      }
    }
  }


  async function deleteStudent() {
    if (deleteStudentId) {
      await supabase.from("students").delete().eq("id", deleteStudentId);
      fetchStudents();
      setDeleteStudentId(null);
    }
  }

  return (
    <div className="p-2 space-y-4 overflow-auto min-h-screen">
      <div className='flex justify-between '>
      <h1 className="text-2xl font-bold ">Students</h1>
      <div className="flex justify-between gap-3 items-center">
        <Button className="bg-gray-200 hover:bg-gray-300 text-black" onClick={() => setIsFilterOpen(!isFilterOpen)}>Filters</Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button>+ Add New</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-[#f9fafa]">
            <DialogTitle>Add New Student</DialogTitle>
            <div>
              <label className="block text-sm text-gray-600">Name</label>
              <Input
                placeholder="Name"
                className="w-full p-2 border rounded-lg bg-[#ffffff]"
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Adm Id</label>
              <Input
                placeholder="Admission ID"
                className="w-full p-2 border rounded-lg bg-[#ffffff]"
                onChange={(e) => setNewStudent({ ...newStudent, admission_id: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <div className="w-1/2">
                <label className="block text-sm text-gray-600">Class</label>
                <select
                  value={newStudent.class || ''}
                  className="w-full p-2 border rounded-lg bg-[#ffffff]"
                  onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })}
                >
                  <option value="1st">1st</option>
                  <option value="2nd">2nd</option>
                  <option value="3rd">3rd</option>
                  <option value="4th">4th</option>
                  <option value="5th">5th</option>
                  <option value="6th">6th</option>
                  <option value="7th">7th</option>
                  <option value="8th">8th</option>
                  <option value="9th">9th</option>
                  <option value="10th">10th</option>
                  <option value="11th">11th</option>
                  <option value="12th">12th</option>
                </select>
              </div>
              <div className="w-1/2">
                <label className="block text-sm text-gray-600">Section</label>
                <Input
                  placeholder="Section"
                  className="w-full p-2 border rounded-lg bg-[#ffffff]"
                  onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Mob No.</label>
              <Input
                placeholder="Mobile Number"
                type="number"
                className="w-full p-2 border rounded-lg bg-[#ffffff]"
                onChange={(e) => setNewStudent({ ...newStudent, mob: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Profile Image URL</label>
              <Input
                placeholder="Profile Image URL"
                className="w-full p-2 border rounded-lg bg-[#ffffff]"
                onChange={(e) => setNewStudent({ ...newStudent, profile: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <div className="w-1/2">
                <label className="block text-sm text-gray-600">Payment Status</label>
                <select
                  value={newStudent.payment_status || 'unpaid'}
                  className="w-full p-2 border rounded-lg bg-[#ffffff]"
                  onChange={(e) => setNewStudent({ ...newStudent, payment_status: e.target.value })}
                >
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>

              <div className="w-1/2">
                <label className="block text-sm text-gray-600">Class Representative</label>
                <select
                  value={String(newStudent.cr) || 'false'}
                  className="w-full p-2 border rounded-lg bg-[#ffffff]"
                  onChange={(e) => setNewStudent({ ...newStudent, cr: e.target.value === 'true' })}
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>

            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button className="w-full flex items-center h-10 rounded-lg justify-center" onClick={addStudent}>Add Student</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>

      {isFilterOpen && (
        <Dialog open={isFilterOpen} onOpenChange={() => setIsFilterOpen(false)}>
        <DialogContent className=" bg-[#f9fafa]">
          <DialogTitle>Filters</DialogTitle>
          <div className="flex gap-3">
          <div className="w-1/2">
            <Select onValueChange={(val) => setFilters({ ...filters, class: val })}>
              <SelectTrigger className="w-full p-2 border rounded-lg bg-[#ffffff]">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
    
          <div className="w-1/2">
            <Select onValueChange={(val) => setFilters({ ...filters, section: val })}>
              <SelectTrigger className="w-full p-2 border rounded-lg bg-[#ffffff]">
                <SelectValue  placeholder="Section" />
              </SelectTrigger>
              <SelectContent >
                {sections.map((sec) => (
                  <SelectItem key={sec} value={sec}>
                    {sec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          </div>
    <div className="flex gap-3">
          <div className="w-1/2">
            <Select onValueChange={(val) => setFilters({ ...filters, payment_status: val })}>
              <SelectTrigger className="w-full p-2 border rounded-lg bg-[#ffffff]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
    
          <div className="w-1/2">
          <div className="flex items-center gap-2 bg-white py-2 px-3 rounded-lg border">
            <input
              type="checkbox"
              className=" border rounded-lg bg-[#ffffff]"
              onChange={(e) => setFilters({ ...filters, cr: e.target.checked })}
              checked={filters.cr}
            />
            <label className="text-gray-500 text-sm">CR</label>
            </div>
          </div>
          </div>
    
          <div className="mt-4 flex justify-end space-x-2">
            <Button variant='ghost' className="bg-slate-200 text-black" onClick={applyFilters}>Apply Filters</Button>
            <DialogClose asChild>
              <Button variant='ghost' className="bg-slate-200 text-black border-2" >Cancel</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
      )}
      </div>

      <div className="overflow-auto rounded-xl">
        <table className="min-w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">S No.</th>
              <th className="border p-2">Adm ID</th>
              <th className="border p-2">Name</th>
              {/* <th className="border p-2">Email</th> */}
              <th className="border p-2">Class</th>
              <th className="border p-2">Sec</th>
              <th className="border p-2">Mobile</th>
              <th className="border p-2">Profile</th>
              <th className="border p-2">Tags</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center p-2">No students found</td>
              </tr>
            ) : (
              filteredStudents.map((student, index) => (
                <tr key={student.id} className="border">
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{student.admission_id}</td>
                  <td className="border p-2">{student.name}</td>
                  {/* <td className="border p-2">{student.email}</td> */}
                  <td className="border p-2">{student.class}</td>
                  <td className="border p-2">{student.section}</td>
                  <td className="border p-2">{student.mob}</td>
                  <td className="border p-2">
                    <a href={student.profile} target="_blank" className="text-blue-500">
                      View Profile
                    </a>
                  </td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 m-1 text-white rounded-full ${student.payment_status === 'paid' ? 'bg-green-500' : 'bg-red-500'}`}>
                      {student.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                    {student.cr && (
                      <span className="px-2 py-1 m-1 rounded-full bg-[#0066ff] text-white">CR</span>
                    )}
                  </td>
                  <td className="border p-2">
                    <Button className="bg-slate-100 text-black hover:bg-slate-200 m-1" onClick={() => { setEditStudent(student); }}> <Edit3Icon /> </Button>
                    <Button className="bg-slate-100 text-black hover:bg-slate-200 m-1" onClick={() => { setDeleteStudentId(student.id); }}> <TrashIcon /> </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editStudent.id} onOpenChange={() => setEditStudent({})}>
        <DialogContent className="sm:max-w-[600px] bg-[#f9fafa]">
          <DialogTitle>Edit Student</DialogTitle>
          <div>
            <label className="block text-sm text-gray-600">Name</label>
            <Input
              value={editStudent.name || ''}
              className="w-full p-2 border rounded-lg bg-[#ffffff]"
              onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })}
            />
          </div>
          <div >
            <label className="block text-sm text-gray-600">Adm Id</label>
            <Input
              value={editStudent.admission_id || ''}
              className="w-full p-2 border rounded-lg bg-[#ffffff]"
              onChange={(e) => setEditStudent({ ...editStudent, admission_id: e.target.value })}
            />
          </div>
          <div className="flex gap-3">
            <div className="w-1/2">
              <label className="block text-sm text-gray-600">Class </label>
              <select
                value={editStudent.class || ''}
                className="w-full p-2 border rounded-lg bg-[#ffffff]"
                onChange={(e) => setEditStudent({ ...editStudent, class: e.target.value })}
              >
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
                <option value="3rd">3rd</option>
                <option value="4th">4th</option>
                <option value="5th">5th</option>
                <option value="6th">6th</option>
                <option value="7th">7th</option>
                <option value="8th">8th</option>
                <option value="9th">9th</option>
                <option value="10th">10th</option>
                <option value="11th">11th</option>
                <option value="12th">12th</option>
              </select>
            </div>

            <div className="w-1/2">
              <label className="block text-sm text-gray-600">Section</label>
              <Input
                value={editStudent.section || ''}
                className="w-full p-2 border rounded-lg bg-[#ffffff]"
                onChange={(e) => setEditStudent({ ...editStudent, section: e.target.value })}
              />

            </div>
          </div>
          <div >
            <label className="block text-sm text-gray-600">Mob No.</label>
            <Input
              value={editStudent.mob || ''}
              type="number"
              className="w-full p-2 border rounded-lg bg-[#ffffff]"
              onChange={(e) => setEditStudent({ ...editStudent, mob: Number(e.target.value) })}
            />
          </div>
          <div >
            <label className="block text-sm text-gray-600">Profile Image Url</label>
            <Input
              value={editStudent.profile || ''}
              className="w-full p-2 border rounded-lg bg-[#ffffff]"
              onChange={(e) => setEditStudent({ ...editStudent, profile: e.target.value })}
            />
          </div>
          {/* <Input
            value={editStudent.profile}
            onChange={(e) => setEditStudent({ ...editStudent, profile: e.target.value })}
          /> */}
          <div className="flex gap-3">
            <div className="w-1/2">
              <label className="block text-sm text-gray-600">Payment Status </label>
              <select
                value={editStudent.payment_status || 'unpaid'}
                className="w-full p-2 border rounded-lg bg-[#ffffff]"
                onChange={(e) => setEditStudent({ ...editStudent, payment_status: e.target.value })}
              >
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
            <div className="w-1/2">
              <label className="block text-sm text-gray-600">Class Representative</label>
              <select
                value={String(editStudent.cr) || 'false'}
                className="w-full p-2 border rounded-lg bg-[#ffffff]"
                onChange={(e) => setEditStudent({ ...editStudent, cr: e.target.value === 'true' })}
              >
                <option value='true'>True</option>
                <option value='false'>False</option>
              </select>

            </div>
          </div>

          {/* <Input
            value={editStudent.profile}
            onChange={(e) => setEditStudent({ ...editStudent, profile: e.target.value })}
          /> */}
          {/* <Input
            value={editStudent.email}
            onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })}
          /> */}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                className="w-full flex items-center h-10 rounded-lg justify-center"
                onClick={async (e) => {


                  try {
                    await updateStudent(); // Wait for the updateStudent function to complete
                    console.log('Student updated successfully');
                  } catch (error) {
                    console.error('Error updating student:', error);
                  }
                }}
              >
                Update
              </Button>
            </DialogClose>


          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteStudentId} onOpenChange={() => setDeleteStudentId(null)}>
        <DialogContent>
          <DialogTitle>Destructive Action</DialogTitle>
          <h2>Are you sure you want to delete this student?</h2>
          <p className="text-blue-500 font-bold">{filteredStudents.find(student => student.id === deleteStudentId)?.name}</p>
          <Button onClick={deleteStudent}>Confirm</Button>
        </DialogContent>
      </Dialog>
    </div>
    
  );
}
