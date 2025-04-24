'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type School = {
  id: string
  name: string
  branch: string
  country: string
  city: string
  image: string
  mobile_number: string
  principal_name: string
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSchools = async () => {
      const { data, error } = await supabase
        .from('school_auth')
        .select('*')

      if (!error && data) {
        setSchools(data as School[])
      }
      setLoading(false)
    }

    fetchSchools()
  }, [])

  return (
    <div className="px-6 py-10 lg:px-20 max-h-full min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-10 text-center text-black">
        Schools Registered With Us
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {schools.map((school) => (
            <Card
              key={school.id}
              className={cn(
                'rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 ease-in-out'
              )}
            >
              <img
                src={school.image || '/lo.png'}
                alt={school.name}
                className="w-full h-48 object-cover rounded-t-2xl"
              />
              <CardContent className="p-4 space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">
                  {school.name}
                </h2>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Branch:</span> {school.branch}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Location:</span>{' '}
                  {school.city}, {school.country}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Mobile:</span>{' '}
                  {school.mobile_number}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Principal:</span>{' '}
                  {school.principal_name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
