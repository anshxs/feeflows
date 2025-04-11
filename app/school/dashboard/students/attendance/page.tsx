'use client';

import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { format, getDaysInMonth } from 'date-fns';
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

type StudentRow = {
    admission_id: string;
    student_name: string;
    class: string;
    section: string;
    attendance_data: Record<string, boolean>;
};

export default function AttendancePage() {
    const [month, setMonth] = useState<Date | null>(new Date());
    const [classes, setClasses] = useState<string[]>([]);
    const [sections, setSections] = useState<string[]>([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [rowData, setRowData] = useState<StudentRow[]>([]);

    const safeMonth = month ?? new Date();
    const daysInMonth = getDaysInMonth(safeMonth);
    const dates = Array.from({ length: daysInMonth }, (_, i) =>
        format(new Date(safeMonth.getFullYear(), safeMonth.getMonth(), i + 1), 'dd/MM/yyyy')
    );


    const handleCheckboxChange = async (student: StudentRow, dateStr: string, checked: boolean) => {
        const updatedAttendance = {
            ...student.attendance_data,
            [dateStr]: checked,
        };

        const { error } = await supabase
            .from('attendance')
            .update({ attendance_data: updatedAttendance })
            .eq('admission_id', student.admission_id);

        if (!error) {
            toast.success(`Student ${student.student_name} marked ${checked ? 'present' : 'absent'}.`);
            setRowData(prev =>
                prev.map(s => s.admission_id === student.admission_id ? { ...s, attendance_data: updatedAttendance } : s)
            );
        } else {
            toast.error(`Failed to mark attendance.`);
        }
    };

    const fetchFilterOptions = async () => {
        const school = JSON.parse(sessionStorage.getItem('schoolSession') || '{}');
        const { data } = await supabase
            .from('students')
            .select('class, section')
            .eq('sxid', school.id);

        if (data) {
            const allClasses = [...new Set(data.map(d => d.class))];
            const allSections = [...new Set(data.map(d => d.section))];
            setClasses(allClasses);
            setSections(allSections);
        }
    };

    const fetchAttendanceData = async () => {
        const school = JSON.parse(sessionStorage.getItem('schoolSession') || '{}');
        if (!school.username || !school.password || !selectedClass || !selectedSection) return;

        const { data } = await supabase.rpc('fetch_attendance_students', {
            input_username: school.username,
            input_password: school.password,
            input_class: selectedClass,
            input_section: selectedSection,
        });
        console.log(data + 'papap');
        console.log(school + 'dadada')

        if (data) {
            setRowData(data);
        } else {
            toast.error('Failed to fetch attendance data.');
        }
    };

    useEffect(() => {
        fetchFilterOptions();
    }, []);

    useEffect(() => {
        if (selectedClass && selectedSection) {
            fetchAttendanceData();
            console.log(selectedClass, selectedSection)
        }
    }, [selectedClass, selectedSection]);

    return (
        <div className="p-2 space-y-4 overflow-x-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Attendance</h1>
                <div className="flex gap-2">
                    {/* Calendar Popover */}
                    <input
                        type="month"
                        className="w-full border px-2 py-1 outline-none rounded-lg bg-[#f9fafa]"
                        value={format(month ?? new Date(), 'yyyy-MM')}
                        onChange={(e) => {
                            if (e.target.value) {
                                setMonth(new Date(e.target.value));
                            }
                        }}
                        onBlur={(e) => {
                            if (!e.target.value) {
                                setMonth(new Date());
                            }
                        }}
                    />

                    {/* Filter Popover */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="bg-[#f9fafa]">
                                <Filter className="h-4 w-4 " />
                                Filters
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="space-y-2 w-60 bg-[#f9fafa] rounded-xl">
                            <div className='flex gap-3'>
                                <select
                                    className="w-1/2 border px-2 py-1 rounded-lg"
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                >
                                    <option value="">Class</option>
                                    {classes.map(cls => (
                                        <option key={cls} value={cls}>{cls}</option>
                                    ))}
                                </select>
                                <select
                                    className="w-1/2 border px-2 py-1 rounded-lg"
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
                                >
                                    <option value="">Section</option>
                                    {sections.map(sec => (
                                        <option key={sec} value={sec}>{sec}</option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                className="w-full rounded-lg"
                                onClick={fetchAttendanceData}
                            >
                                Apply Filters
                            </Button>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Attendance Table */}
            {/* Conditional Rendering: If no data, show message and filter button */}
            {rowData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center gap-4 border rounded-lg bg-gray-50">
                    <p className="text-lg text-gray-500">No students found. Please apply class filters.</p>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="bg-[#f9fafa]">
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="space-y-2 w-60 bg-[#f9fafa] rounded-xl">
                            <div className='flex gap-3'>
                                <select
                                    className="w-1/2 border px-2 py-1 rounded-lg"
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                >
                                    <option value="">Class</option>
                                    {classes.map(cls => (
                                        <option key={cls} value={cls}>{cls}</option>
                                    ))}
                                </select>
                                <select
                                    className="w-1/2 border px-2 py-1 rounded-lg"
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
                                >
                                    <option value="">Section</option>
                                    {sections.map(sec => (
                                        <option key={sec} value={sec}>{sec}</option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                className="w-full rounded-lg"
                                onClick={fetchAttendanceData}
                            >
                                Apply Filters
                            </Button>
                        </PopoverContent>
                    </Popover>
                </div>
            ) : (
                <div className="overflow-auto border rounded-lg">
                    <table className="min-w-full text-sm text-center border-collapse">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-2 py-3">S.No</th>
                                <th className="border px-2 py-3">Name</th>
                                <th className="border px-2 py-3">%</th>
                                {dates.map(date => (
                                    <th key={date} className="border px-1 py-1 text-xs">
                                        {format(new Date(date.split('/').reverse().join('-')), 'd')}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rowData.map((student, index) => (
                                <tr key={student.admission_id}>
                                    <td className="border px-2 py-2">{index + 1}</td>
                                    <td className="border px-2 py-2">{student.student_name}</td>
                                    <td className="border px-2 py-2">
                                        {(() => {
                                            const presentDays = dates.filter(date => student.attendance_data?.[date]).length;
                                            const percentage = (presentDays / dates.length) * 100;
                                            return `${percentage.toFixed(1)}%`;
                                        })()}
                                    </td>

                                    {dates.map(date => (
                                        <td key={date} className="border px-2 py-2">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox rounded-full border border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={student.attendance_data?.[date] || false}
                                                onChange={(e) => handleCheckboxChange(student, date, e.target.checked)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
}
