'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface MagicLink {
  id: string;
  magic_pass: string;
  school_id: string;
  class: string;
  section: string;
}

interface Student {
  id: string;
  name: string;
}

export default function MagicAttendancePage() {
  const { magicId } = useParams();
  const [passcode, setPasscode] = useState<string>('');
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [magicLink, setMagicLink] = useState<MagicLink | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [presentMap, setPresentMap] = useState<{ [id: string]: boolean }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const today = format(new Date(), 'dd/MM/yyyy');

  const handlePasscodeSubmit = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('magic_attendance')
      .select('*')
      .eq('id', magicId)
      .single();

    if (error || !data || data.magic_pass !== passcode) {
      setError('Invalid credentials');
      setLoading(false);
      return;
    }

    setMagicLink(data);
    setAuthenticated(true);
    setLoading(false);
  };

  useEffect(() => {
    if (!authenticated || !magicLink) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        const { data: schoolMatch, error: schoolError } = await supabase
          .from('schools')
          .select('id')
          .eq('sxid', magicLink.school_id)
          .single();

        if (schoolError || !schoolMatch) {
          console.error('School fetch error:', schoolError);
          setLoading(false);
          return;
        }

        const { data: studentList, error: studentError } = await supabase
          .from('students')
          .select('id, name')
          .eq('school_id', schoolMatch.id)
          .eq('class', magicLink.class)
          .eq('section', magicLink.section);

        if (studentError || !studentList) {
          console.error('Student fetch error:', studentError);
          setLoading(false);
          return;
        }

        const studentIds = studentList.map((s) => s.id);
        const { data: attendanceRecords, error: attendanceError } = await supabase
          .from('attendance')
          .select('admission_id, attendance_data')
          .in('admission_id', studentIds);

        if (attendanceError) {
          console.error('Attendance fetch error:', attendanceError);
          setLoading(false);
          return;
        }

        const presentMapData: { [id: string]: boolean } = {};
        for (const student of studentList) {
          const record = attendanceRecords?.find(r => r.admission_id === student.id);
          const isPresent = record?.attendance_data?.[today] === true;
          presentMapData[student.id] = isPresent;
        }

        setStudents(studentList);
        setPresentMap(presentMapData);
      } catch (err) {
        console.error('Unexpected fetch error:', err);
      }

      setLoading(false);
    };

    fetchData();
  }, [authenticated, magicLink]);

  const togglePresent = (id: string) => {
    setPresentMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    console.log("Starting handleSave...");
  
    for (const student of students) {
      const isPresent = presentMap[student.id] || false;
  
      // Step 1: Fetch existing attendance data
      const { data: existing, error: fetchError } = await supabase
        .from('attendance')
        .select('attendance_data')
        .eq('admission_id', student.id)
        .maybeSingle();
  
      if (fetchError) {
        console.error(`Fetch error for ${student.name}:`, fetchError);
        continue;
      }
  
      let updatedData = { [today]: isPresent };
  
      if (existing?.attendance_data) {
        updatedData = {
          ...existing.attendance_data,
          [today]: isPresent,
        };
      }
  
      try {
        if (existing) {
          const { error: updateError } = await supabase
            .from('attendance')
            .update({
              attendance_data: updatedData,
            })
            .eq('admission_id', student.id);
  
          if (updateError) {
            console.error(`Update error for ${student.name}:`, updateError);
          } else {
            console.log(`Updated successfully for ${student.name}`);
          }
        } else {
          const { error: insertError } = await supabase
            .from('attendance')
            .insert({
              admission_id: student.id,
              school_id: magicLink!.school_id,
              class: magicLink!.class,
              section: magicLink!.section,
              attendance_data: updatedData,
            });
  
          if (insertError) {
            console.error(`Insert error for ${student.name}:`, insertError);
          } else {
            console.log(`Inserted successfully for ${student.name}`);
          }
        }
      } catch (err) {
        console.error(`Unexpected error for ${student.name}:`, err);
      }
    }
  
    console.log("handleSave complete.");
    alert('Attendance saved!');
  };
  
  

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f9fafa]">
        <div className="bg-[#f9fafa] rounded-lg p-6 w-96">
          <h2 className="text-2xl font-bold mb-4">Magic Attendance</h2>
          <div className="mb-3">
            <label className="block text-sm text-gray-600">Passcode</label>
            <input
              type="text"
              placeholder="anshsx"
              className="w-full p-2 border rounded-lg bg-[#ffffff]"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
            />
          </div>

          <Button className="w-full flex items-center h-10 rounded-lg justify-center" onClick={handlePasscodeSubmit} disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Next"}
          </Button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <a
            href={`mailto:support@yourschool.com?subject=Forgot Credentials&body=School Name: `}
            className="text-blue-600 text-sm mt-4 inline-block"
          >
            Forgot credentials?
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* AppBar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#e9e9e9e7] shadow">
        <div className="text-xl font-bold">YourLogo</div>
        <Button onClick={handleSave} className="px-4 py-2 rounded-lg">
          Save
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-auto border rounded-lg m-4">
        <table className="min-w-full border border-gray-300 rounded-xl">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2 border">Name</th>
              <th className="text-left p-2 border">{today}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="text-center p-4">Loading...</td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2 border">{s.name}</td>
                  <td className="p-2 border">
                    <input
                      type="checkbox"
                      checked={presentMap[s.id] || false}
                      onChange={() => togglePresent(s.id)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
