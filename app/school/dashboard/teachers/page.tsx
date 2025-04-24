'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash, GraduationCap, CreditCard, Loader2 } from 'lucide-react';

type Teacher = {
  id: number;
  name: string;
  stafftype: string;
  classlevel: string;
  salary: string;
  account_holder: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  branch_name: string;
  bank_address: string;
  bank_contact: string;
  bank_city: string;
  bank_district: string;
  bank_state: string;
  new_salary?: string; // Optional field for the updated salary
};


export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [newTeacher, setNewTeacher] = useState({
    name: '',
    stafftype: '',
    classlevel: '',
    salary: '',
    account_holder: '',
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    branch_name: '',
    bank_address: '',
    bank_contact: '',
    bank_city: '',
    bank_district: '',
    bank_state: '',
  });

  const [schoolId, setSchoolId] = useState<number | null>(null);

  const fetchTeachers = async () => {
    setLoading(true);  // Set loading to true before fetching
    const { data } = await supabase
      .from('teachers')
      .select('*')
      .eq('school_id', schoolId);
    setTeachers(data || []);
    setLoading(false);  // Set loading to false after fetching is complete
  };
  

  useEffect(() => {
    const session = sessionStorage.getItem('schoolSession');
    if (session) {
      const parsed = JSON.parse(session);
      setSchoolId(parsed.id);
    }
  }, []);

  useEffect(() => {
    if (schoolId) fetchTeachers();
  }, [schoolId]);

  const handleAddTeacher = async () => {
    if (!schoolId) return;
    await supabase.from('teachers').insert([
      { ...newTeacher, school_id: schoolId },
    ]);
    setNewTeacher({
      name: '', stafftype: '', classlevel: '', salary: '', account_holder: '', account_number: '',
      ifsc_code: '',
      bank_name: '',
      branch_name: '',
      bank_address: '',
      bank_contact: '',
      bank_city: '',
      bank_district: '',
      bank_state: '',
    });
    fetchTeachers();
  };

  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const response = await fetch(`https://ifsc.razorpay.com/${newTeacher.ifsc_code}`);
        if (!response.ok) throw new Error('Invalid IFSC Code');

        const data = await response.json();

        setNewTeacher((prev) => ({
          ...prev,
          bank_name: data.BANK || '',
          branch_name: data.BRANCH || '',
          bank_address: data.ADDRESS || '',
          bank_city: data.CITY || '',
          bank_district: data.DISTRICT || '',
          bank_state: data.STATE || '',
          bank_contact: data.CONTACT || '',
        }));
      } catch (error) {
        console.error("Error fetching bank details:", error);
        // Optionally reset fields or show a toast/message
      }
    };

    if (newTeacher.ifsc_code.length === 11) {
      fetchBankDetails();
    }
  }, [newTeacher.ifsc_code]);

  const handleSalaryUpdate = async (id: number, newSalary: string) => {
    await supabase
      .from('teachers')
      .update({ new_salary: newSalary })
      .eq('id', id);
    fetchTeachers();
  };

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  const openDialog = (id: number) => {
    setSelectedId(id);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setSelectedId(null);
  };
  

  const handleDelete = async () => {
    if (selectedId !== null) {
      await supabase.from("teachers").delete().eq("id", selectedId);
      fetchTeachers();
    }
    closeDialog();
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {loading ? (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    ) : (
      <>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg gap-2 bg-[#f5f5f5]">
          <h2 className="text-[18px] font-bold text-black">{teachers.length}</h2></div>
          <div className="flex items-center gap-2">
            <Button className='bg-slate-100' disabled variant='ghost'>Pay Salary</Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Teacher</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-[#f9fafa]">
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-1">
              <div className="mb-3">
                <label className="block text-sm text-gray-600">Name</label>
                <input
                  type="text"
                  placeholder="Teacher Name"
                  className="w-full p-2 border rounded-lg bg-[#ffffff]"
                  value={newTeacher.name}
                  required
                  onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                />
              </div>

              <div className="flex gap-2 mb-3">
                <div className="w-1/2">
                  <label className="block text-gray-600 text-sm">Staff Type</label>

                  <select
                    className="w-full p-2 border rounded-lg bg-[#ffffff]"
                    value={newTeacher.stafftype}
                    onChange={(e) => setNewTeacher({ ...newTeacher, stafftype: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="Teaching">Teaching</option>
                    <option value="Non-Teaching">Non-Teaching</option>
                  </select>
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-600 text-sm">Class Level</label>

                  <select
                    className="w-full p-2 border rounded-lg bg-[#ffffff]"
                    value={newTeacher.classlevel}
                    onChange={(e) => setNewTeacher({ ...newTeacher, classlevel: e.target.value })}
                    disabled={newTeacher.stafftype !== "Teaching"}
                  >
                    <option value="">Select</option>
                    <option value="PGT">PGT</option>
                    <option value="TGT">TGT</option>
                    <option value="PRT">PRT</option>
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-gray-600 text-sm">Avg Salary</label>
                <input
                  type="text"
                  placeholder="Avg Salary"
                  className="w-full p-2 border rounded-lg bg-[#ffffff]"
                  value={newTeacher.salary}
                  onChange={(e) => setNewTeacher({ ...newTeacher, salary: e.target.value })}
                />
              </div>
              <hr />
              <div className="flex gap-2 mb-3">
                <div className="w-1/2">
                  <label className="block text-gray-600 text-sm">Acc Holder&apos;s Name</label>

                  <input
                    type="text"
                    placeholder="Holder's Name"
                    className="w-full p-2 border rounded-lg bg-[#ffffff]"
                    value={newTeacher.account_holder}
                    onChange={(e) => setNewTeacher({ ...newTeacher, account_holder: e.target.value })}
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-600 text-sm">Account Number</label>

                  <input
                    type="text"
                    placeholder="Account Number"
                    className="w-full p-2 border rounded-lg bg-[#ffffff]"
                    value={newTeacher.account_number}
                    onChange={(e) => setNewTeacher({ ...newTeacher, account_number: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                <div className="w-1/2">
                  <label className="block text-gray-600 text-sm">IFSC Code</label>

                  <input
                    type="text"
                    placeholder="IFSC Code"
                    className="w-full p-2 border rounded-lg bg-[#ffffff]"
                    value={newTeacher.ifsc_code}
                    onChange={(e) => setNewTeacher({ ...newTeacher, ifsc_code: e.target.value })}
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-600 text-sm">Bank Name</label>

                  <input
                    type="text"
                    placeholder="Account Number"
                    disabled={true}
                    className="w-full p-2 border rounded-lg bg-[#e8eeee]"
                    value={`${newTeacher.bank_name}${newTeacher.branch_name ? ', ' + newTeacher.branch_name : ''}`}
                  />
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                <div className="w-1/2">
                  <label className="block text-gray-600 text-sm">Bank Address A</label>

                  <input
                    type="text"
                    placeholder="Account Number"
                    disabled={true}
                    className="w-full p-2 border rounded-lg bg-[#e8eeee]"
                    value={newTeacher.bank_address}
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-600 text-sm">Bank Address B</label>

                  <input
                    type="text"
                    placeholder="Account Number"
                    disabled={true}
                    className="w-full p-2 border rounded-lg bg-[#e8eeee]"
                    value={[
                      newTeacher.bank_city,
                      newTeacher.bank_district,
                      newTeacher.bank_state,
                    ].filter(Boolean).join(', ')}
                  />
                </div>
              </div>

            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button className="w-full flex items-center h-10 rounded-lg justify-center" onClick={handleAddTeacher}>Add</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>
      <hr/>
      {teachers.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-gray-400 h-64">
          <GraduationCap size={64} className="mb-4" />
          <p className="text-xl">No teachers. Add now.</p>
        </div>
      ) : (teachers.map((t) => (
        <div key={t.id} className="border rounded-2xl bg-[#f5f5f5] p-4 ">
          <div className='flex justify-between'><h3 className="font-bold text-lg">{t.name}</h3>
            
            <button onClick={() => openDialog(t.id)}>
              <Trash className=" text-red-500" size={20} />
            </button>
       
            </div>

          <div className="flex justify-between gap-3"><div className='w-1/2'><p className='text-sm flex text-gray-500 gap-0.5'>{t.stafftype} {t.stafftype === "Teaching" && <a className='text-sm text-gray-500'>{t.classlevel}</a>}</p>
          <div className=' gap-1 flex flex-col'>
          <p className="text-sm flex text-gray-600"><span style={{fontWeight: 600,color: '#3b82f6'}}>Acc Holder</span> {t.account_holder}</p>
          <p className="text-sm flex text-gray-600"><span style={{fontWeight: 600,color: '#3b82f6'}}>Acc No.</span> {t.account_number}</p>
          <p className="text-sm flex text-gray-600"><span style={{fontWeight: 600,color: '#3b82f6'}}>Bank</span> {t.bank_name}</p></div>
            </div>
            <div className="flex items-end w-1/2">
              <div className='flex flex-col gap-1'>
                <div>
              <p className="text-sm flex text-gray-500">Contract: ₹{t.salary}</p>
              <p className='text-sm flex text-gray-500'>Current Salary: ₹{t.new_salary || 'Not Assigned'}</p></div>
              <div className='flex'>
              <input
                type="text"
                placeholder="Assign Salary"
                className="p-2 h-10 w-full border rounded-none rounded-tl-lg rounded-bl-lg bg-[#ffffff]"
                onChange={(e) => (t.new_salary = e.target.value)}
              />
              <Button
  className="rounded-tr-lg rounded-tl-none rounded-bl-none rounded-br-lg h-10"
  onClick={() => handleSalaryUpdate(t.id, t.new_salary || "")}  // Fallback to an empty string
>
  Save
</Button></div>
              </div>
            </div>
          </div>
        </div>
      )))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">Are you sure you want to delete this teacher?</p>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </>
      )}
    </div>
  );
}
