'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
    Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type Charge = {
    title: string
    amount: string
}
type CampaignMap = {
    [title: string]: {
        desc: Record<string, number>,
        studentIds: string[]
    }
}
type StudentInfo = {
    id: string
    name: string
    class: string
    section: string
    mob: string
  }


export default function FeeManagement() {
    const [open, setOpen] = useState(false)
    const [classes, setClasses] = useState<string[]>([])
    const [selectedClasses, setSelectedClasses] = useState<string[]>([])
    const [startMonth, setStartMonth] = useState('')
    const [endMonth, setEndMonth] = useState('')
    const [charges, setCharges] = useState<Charge[]>([{ title: '', amount: '' }])
    const [loading, setLoading] = useState(false)
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
    const [selectedCampaignIndex, setSelectedCampaignIndex] = useState<number | null>(null)
    const [defaultersDialogOpen, setDefaultersDialogOpen] = useState(false)
    const [currentDefaulters, setCurrentDefaulters] = useState<StudentInfo[]>([])
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [schoolId, setSchoolId] = useState<number | null>(null)
    const [fetching, setFetching] = useState(true)

    const fetchDefaulterDetails = async (studentIds: string[]) => {
        if (!studentIds.length) return
      
        const { data, error } = await supabase
          .from('students')
          .select('id, name, class, section, mob')
          .in('id', studentIds)
      
        if (error) {
          console.error("❌ Error fetching student details:", error)
          toast.error("Failed to load student details")
          return
        }
      
        console.log("📋 Defaulter details:", data)
        setCurrentDefaulters(data || [])
      }
      

    useEffect(() => {
        (async () => {
            setFetching(true)
            try {
                const session = sessionStorage.getItem('schoolSession')
                if (!session) return

                const { username, password } = JSON.parse(session)

                const { data: authData } = await supabase
                    .from('school_auth')
                    .select('id')
                    .eq('username', username)
                    .eq('password', password)
                    .single()

                if (!authData) return

                const { data: schoolData } = await supabase
                    .from('schools')
                    .select('id')
                    .eq('sxid', authData.id)
                    .single()

                if (!schoolData) return

                const sid = schoolData.id
                setSchoolId(sid)

                const { data: feeData } = await supabase
                    .from('fee_structure')
                    .select('student_id, description')
                    .eq('school_id', sid)

                if (!feeData) return

                const studentIds = feeData.map(row => row.student_id).filter(Boolean)

                const { data: studentData, error: studentError } = await supabase
                    .from('students')
                    .select('class')
                    .in('id', studentIds)

                if (studentError || !studentData) {
                    toast.error('Failed to fetch students for classes')
                    return
                }

                const uniqueClasses = Array.from(new Set(studentData.map(s => s.class).filter(Boolean)))
                setClasses(uniqueClasses)

                const campaignMap: CampaignMap = {}
                for (const row of feeData) {
                    let parsedCampaigns: { title: string; desc: Record<string, number> }[] = []
                    try {
                        parsedCampaigns = JSON.parse(row.description || '[]')
                        if (!Array.isArray(parsedCampaigns)) continue
                    } catch (e) {
                        continue
                    }

                    for (const campaign of parsedCampaigns) {
                        const { title, desc } = campaign
                        if (!title || typeof desc !== 'object') continue

                        if (!campaignMap[title]) {
                            campaignMap[title] = { desc, studentIds: [] }
                        }

                        if (row.student_id) {
                            campaignMap[title].studentIds.push(row.student_id)
                        }
                    }
                }

                const finalCampaigns = Object.entries(campaignMap).map(([title, { desc, studentIds }]) => ({
                    title,
                    desc,
                    studentIds
                }))
                setCampaigns(finalCampaigns)

            } catch (err) {
                console.error("Error during fetch:", err)
            } finally {
                setFetching(false)
            }
        })()
    }, [])

    const addChargeRow = () => {
        setCharges(prev => [...prev, { title: '', amount: '' }])
    }

    const handleChargeChange = (index: number, field: keyof Charge, value: string) => {
        setCharges(prev => {
            const updated = [...prev]
            updated[index][field] = value
            return updated
        })
    }

    const handleSubmit = async () => {
        setLoading(true)

        const session = sessionStorage.getItem('schoolSession')
        if (!session || !schoolId) {
            toast.error('Invalid session or school ID missing')
            setLoading(false)
            return
        }

        const { username, password } = JSON.parse(session)

        const { data: authData } = await supabase
            .from('school_auth')
            .select('id')
            .eq('username', username)
            .eq('password', password)
            .single()

        if (!authData) {
            toast.error('Session expired or invalid')
            setLoading(false)
            return
        }

        const feeDescription = {
            title: `${startMonth} - ${endMonth}`,
            desc: charges.reduce((acc, curr) => {
                if (curr.title && curr.amount) {
                    acc[curr.title] = parseFloat(curr.amount)
                }
                return acc
            }, {} as Record<string, number>)
        }

        const { data: feeRows, error: feeRowError } = await supabase
            .from('fee_structure')
            .select('id, student_id, description')
            .eq('school_id', schoolId)

        if (feeRowError || !feeRows) {
            toast.error('Failed to access fee structure')
            setLoading(false)
            return
        }

        const studentIds = feeRows.map(row => row.student_id).filter(Boolean)
        const { data: studentData } = await supabase
            .from('students')
            .select('id, class')
            .in('id', studentIds)

        const studentClassMap = Object.fromEntries(
            (studentData ?? []).map(s => [s.id, s.class])
        )

        for (const row of feeRows) {
            const studentClass = studentClassMap[row.student_id]
            if (!selectedClasses.includes(studentClass)) continue

            let prev: any[] = []
            try {
                const parsed = JSON.parse(row.description || '[]')
                prev = Array.isArray(parsed) ? parsed : [parsed]
            } catch {
                prev = []
            }

            prev.push(feeDescription)

            await supabase
                .from('fee_structure')
                .update({
                    description: JSON.stringify(prev),
                })
                .eq('id', row.id)
        }

        setLoading(false)
        setOpen(false)
        setCharges([{ title: '', amount: '' }])
        setSelectedClasses([])
        setStartMonth('')
        setEndMonth('')

        const { data: updatedFeeData } = await supabase
            .from('fee_structure')
            .select('description')
            .eq('school_id', schoolId)

        const updatedCampaigns = (updatedFeeData ?? []).flatMap(row => {
            try {
                return JSON.parse(row.description || '[]')
            } catch {
                return []
            }
        })

        setCampaigns(updatedCampaigns)
    }



    if (fetching) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="animate-spin h-10 w-10 text-gray-500" />
            </div>
        )
    }
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Fee Management</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Fee Campaign</DialogTitle>
                        </DialogHeader>

                        <div className="mb-4">
                            <Label>Choose Classes</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {classes.length === 0 && <p className="text-sm text-gray-500">No classes found.</p>}
                                {classes.map(cls => (
                                    <button
                                        key={cls}
                                        onClick={() =>
                                            setSelectedClasses(prev =>
                                                prev.includes(cls)
                                                    ? prev.filter(c => c !== cls)
                                                    : [...prev, cls]
                                            )
                                        }
                                        className={cn(
                                            'px-3 py-1 rounded-md border text-sm',
                                            selectedClasses.includes(cls)
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100'
                                        )}
                                    >
                                        {cls}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 mb-4">
                            <div className="w-1/2">
                                <Label>From Month</Label>
                                <Input value={startMonth} onChange={e => setStartMonth(e.target.value)} placeholder="e.g. Jan" />
                            </div>
                            <div className="w-1/2">
                                <Label>To Month</Label>
                                <Input value={endMonth} onChange={e => setEndMonth(e.target.value)} placeholder="e.g. Mar" />
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <Label>Charges</Label>
                            {charges.map((c, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input value={c.title} onChange={e => handleChargeChange(i, 'title', e.target.value)} placeholder="e.g. Tuition" />
                                    <Input value={c.amount} onChange={e => handleChargeChange(i, 'amount', e.target.value)} placeholder="Amount" type="number" />
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={addChargeRow}>+ Add More</Button>
                        </div>

                        <DialogFooter>
                            <Button onClick={handleSubmit} disabled={loading}>
                                {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                Add
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaigns.map((camp, idx) => (
                    <div key={idx} className="border rounded-xl bg-[#e9e9e9ad] p-4 shadow-sm relative">
                        <h2 className="text-lg font-bold mb-2">{camp.title}</h2>
                        <ul className="text-sm mb-4">
                            {camp.desc && typeof camp.desc === 'object' ? (
                                Object.entries(camp.desc).map(([key, val]) => (
                                    <li key={key}>
                                        <strong>{key}:</strong> ₹{Number(val).toLocaleString()}
                                    </li>
                                ))
                            ) : (
                                <li className="text-red-500">Invalid campaign description</li>
                            )}
                        </ul>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-3 right-3"
                            onClick={() => {
                                setSelectedCampaignIndex(idx)
                                setConfirmDeleteOpen(true)
                            }}
                        >
                            Delete
                        </Button>
                        <Button
  onClick={() => {
    fetchDefaulterDetails(camp.studentIds) // or however you're storing IDs
    setDefaultersDialogOpen(true)
  }}
>
  View Defaulters
</Button>

                    </div>
                ))}
            </div>
            <Dialog open={defaultersDialogOpen} onOpenChange={setDefaultersDialogOpen}>
  <DialogContent className="max-w-3xl rounded-2xl ">
    <DialogHeader>
      <DialogTitle>Defaulters for this Campaign</DialogTitle>
    </DialogHeader>

    {currentDefaulters.length === 0 ? (
      <p className="text-sm text-gray-500 mt-4">No student data available.</p>
    ) : (
      <div className="overflow-x-auto mt-4 rounded-xl">
        <table className="w-full text-sm border rounded-2xl">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2 border">Name</th>
              <th className="text-left px-4 py-2 border">Class</th>
              <th className="text-left px-4 py-2 border">Section</th>
              <th className="text-left px-4 py-2 border">Mobile</th>
            </tr>
          </thead>
          <tbody>
            {currentDefaulters.map((student) => (
              <tr key={student.id} className="border-t">
                <td className="px-4 py-2 border">{student.name}</td>
                <td className="px-4 py-2 border">{student.class}</td>
                <td className="px-4 py-2 border">{student.section}</td>
                <td className="px-4 py-2 border">{student.mob}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    <DialogFooter className="mt-4">
      <Button variant="outline" onClick={() => setDefaultersDialogOpen(false)}>
        Close
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>



            <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete this fee campaign?</p>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={async () => {
                                if (selectedCampaignIndex === null || schoolId === null) return

                                const { data: rows } = await supabase
                                    .from('fee_structure')
                                    .select('*')
                                    .eq('school_id', schoolId)

                                if (!rows || rows.length === 0) {
                                    toast.error('No fee structure found')
                                    return
                                }

                                for (const row of rows) {
                                    let prev: any[] = []
                                    try {
                                        const parsed = JSON.parse(row.description || '[]')
                                        prev = Array.isArray(parsed) ? parsed : [parsed]
                                    } catch (e) {
                                        console.error('Failed to parse description:', e)
                                        continue
                                    }

                                    prev.splice(selectedCampaignIndex, 1)

                                    await supabase
                                        .from('fee_structure')
                                        .update({ description: JSON.stringify(prev) })
                                        .eq('id', row.id)
                                }

                                toast.success('Deleted fee campaign')
                                setConfirmDeleteOpen(false)
                                setSelectedCampaignIndex(null)

                                // Refresh campaigns
                                const { data: feeData } = await supabase
                                    .from('fee_structure')
                                    .select('description')
                                    .eq('school_id', schoolId)

                                const allCampaigns = (feeData ?? []).flatMap(row => {
                                    try {
                                        return JSON.parse(row.description || '[]')
                                    } catch (e) {
                                        return []
                                    }
                                })

                                setCampaigns(allCampaigns)
                            }}
                        >
                            Yes, Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>

    )
}
