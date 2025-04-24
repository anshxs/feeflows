'use client';
import { useEffect, useState } from 'react';
import { MapPin, Phone, AtSign } from 'lucide-react';
import MagicAttendance from '@/components/MagicComp';
import Image from 'next/image';

// Define a type for the school data
interface School {
  name: string;
  branch: string;
  city: string;
  country: string;
  mobile_number: string;
  username: string;
  image?: string; // Optional image field
}

export default function SchoolProfile() {
  const [school, setSchool] = useState<School | null>(null);

  useEffect(() => {
    const session = sessionStorage.getItem('schoolSession');
    if (session) {
      setSchool(JSON.parse(session));
      console.log(session);
    }
  }, []);

  if (!school) return null;

  return (
    <>
    <div className="flex items-center gap-6 mb-6 p-6 bg-[#e9e9e9ad] rounded-2xl border">
      <div className="flex items-center space-x-4">
        <Image
          src={school.image || '/lo.png'}
          alt="school profile"
          width={80}  // Adjust the size as needed
          height={80} // Adjust the size as needed
          className="rounded-full object-cover"
        />
        <div className="space-y-1">
          <h2 className="text-xl font-bold">{school.name}</h2>
          <p className="text-sm text-gray-600 flex items-center gap-1"><MapPin size={14}/>
          <a className="text-blue-500">{school.branch}, {school.city}, {school.country}</a>
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-1"><Phone size={14}/> <a className="text-blue-500">{school.mobile_number}</a></p>
          <p className="text-sm text-gray-600 flex items-center gap-1"><AtSign size={14}/> <a className="text-blue-500">{school.username}</a></p>
        </div>
      </div>
    </div>
    <div className='max-w-screen overflow-x-auto'>
    <MagicAttendance/>
    </div>
    </>
  );
}
