'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function RegisterForm() {
    const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    schoolName: '',
    branchPlace: '',
    city: '',
    country: '',
    mobile: '',
    principalName: '',
    registrarName: '',
    registrarPost: '',
    registrarMobile: '',
    image: null as File | null,
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === 'image' && files && files.length > 0) {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      let imageUrl = '';
  
      // ✅ Upload school image if provided
      if (form.image) {
        const fileExt = form.image.name.split('.').pop();
        const fileName = `schools/${Date.now()}-${form.image.name}`;
        const filePath = `${fileName}`;
  
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('school-images')
          .upload(filePath, form.image, {
            cacheControl: '3600',
            upsert: false,
            contentType: form.image.type,
          });
  
        if (uploadError) {
          console.error('❌ Image upload error:', uploadError.message);
          alert('Image upload failed. Please try again.');
          setLoading(false);
          return;
        }
  
        const { data: urlData } = supabase.storage
          .from('school-images')
          .getPublicUrl(filePath);
  
        imageUrl = urlData?.publicUrl || '';
      }
  
      // ✅ Insert data into `prschool` table
      const { error: insertError } = await supabase.from('prschool').insert([
        {
          school_name: form.schoolName,
          branch_place: form.branchPlace,
          city: form.city,
          country: form.country,
          mobile: form.mobile,
          principal_name: form.principalName,
          registrar_name: form.registrarName,
          registrar_post: form.registrarPost,
          registrar_mobile: form.registrarMobile,
          image_url: imageUrl,
        },
      ]);
  
      if (insertError) {
        console.error('❌ Supabase insert error:', insertError.message);
        alert('Something went wrong while submitting the form.');
        setLoading(false);
        return;
      }
  
      // ✅ Success — show green tick
      setSubmitted(true);
    } catch (err: unknown) {
  if (err instanceof Error) {
    console.error('Unexpected error:', err.message);
  } else {
    console.error('Unexpected error:', err);
  }
  alert('Something went wrong. Please try again.');
}

  };
  

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <CheckCircle color="green" className="text-green-500 w-16 h-16 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800">Your request has been successfully registered</h2>
        <p className="text-gray-600">We will try to reach you out as soon as possible.&apos;</p>

      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f9fafa]">
        <div className="p-6 w-full flex justify-center bg-[#f9fafa] rounded-lg">

      <form
        onSubmit={handleSubmit}
        className="bg-[#f9fafa] p-10 rounded-3xl max-w-2xl w-full grid"
      >
        <h1 className="text-4xl font-semibold text-center text-gray-900 mb-4">
          School Registration Form
        </h1>
        <div className="mb-4">
        <label className="block text-gray-600 text-sm">School Name</label>
        <input
          name="schoolName"
          placeholder="XYZ School"
          onChange={handleChange}
          value={form.schoolName}
          className="w-full p-2 border rounded-lg bg-[#ffffff]"
          required
        />
        </div>
        <div className="mb-4">
        <label className="block text-gray-600 text-sm">Branch Name</label>
        <input
          name="branchPlace"
          placeholder="School Branch Name"
          onChange={handleChange}
          value={form.branchPlace}
          className="w-full p-2 border rounded-lg bg-[#ffffff]"
          required
        />
        </div>
        <div className="flex gap-2 mb-3">
            <div className="w-1/2">
              <label className="block text-gray-600 text-sm">City</label>
          <input
            name="city"
            placeholder="City"
            onChange={handleChange}
            value={form.city}
            className="w-full p-2 border rounded-lg bg-[#ffffff]"
            required
          />
          </div>
            <div className="w-1/2">
              <label className="block text-gray-600 text-sm">Country</label>
          <input
            name="country"
            placeholder="Country"
            onChange={handleChange}
            value={form.country}
            className="w-full p-2 border rounded-lg bg-[#ffffff]"
            required
          />
        </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-600 text-sm">Mobile Number</label>
        <input
          name="mobile"
          placeholder="School Mobile Number"
          onChange={handleChange}
          value={form.mobile}
          className="w-full p-2 border rounded-lg bg-[#ffffff]"
          required
        />
        </div>
        <div className="mb-4">
          <label className="block text-gray-600 text-sm">Principal&apos;s Name</label>
        <input
          name="principalName"
          placeholder="Principal"
          onChange={handleChange}
          value={form.principalName}
          className="w-full p-2 border rounded-lg bg-[#ffffff]"
          required
        />
        </div>
        <div className="mb-4">
          <label className="block text-gray-600 text-sm">Registrar&apos;s Name</label>
        <input
          name="registrarName"
          placeholder="Form Registrar Name"
          onChange={handleChange}
          value={form.registrarName}
          className="w-full p-2 border rounded-lg bg-[#ffffff]"
          required
        />
        </div>
        <div className="mb-4">
          <label className="block text-gray-600 text-sm">Registrar&apos;s Post</label>
        <input
          name="registrarPost"
          placeholder="Registrar's Post in School"
          onChange={handleChange}
          value={form.registrarPost}
          className="w-full p-2 border rounded-lg bg-[#ffffff]"
          required
        />
        </div><div className="mb-4">
        <label className="block text-gray-600 text-sm">Registrar&apos;s Mobile</label>

        <input
          name="registrarMobile"
          placeholder="Registrar's Mobile Number"
          onChange={handleChange}
          value={form.registrarMobile}
          className="w-full p-2 border rounded-lg bg-[#ffffff]"
          required
        />
        </div>
        <div className="mb-4">
          <label className="block text-gray-600 text-sm">School&apos;s Logo</label>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="w-full p-2 border rounded-lg bg-[#ffffff]"
        />
        </div>

        <Button
  disabled={loading}
  className="w-full flex items-center h-10 rounded-lg justify-center"
  type="submit"
>
  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit for Verification"}
</Button>
      </form>
      
      </div>
    </div>
  );
}
