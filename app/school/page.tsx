'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function SchoolLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(false);
    const { data, error } = await supabase
      .from('school_auth')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (data && !error) {
      sessionStorage.setItem('schoolSession', JSON.stringify(data));
      setIsLoggedIn(true);
      router.push('/school/dashboard');
    } else {
      setError('Invalid credentials');
    }
    setLoading(false);
  };

  useEffect(() => {
    const session = sessionStorage.getItem('schoolSession');
    if (session) {
      router.push('/school/dashboard');
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f9fafa]">
      <div className="bg-[#f9fafa] rounded-lg p-6 w-96">
        <h2 className="text-2xl font-bold mb-4">Principal Login</h2>
        <div className="mb-3">
          <label className="block text-sm text-gray-600">Username</label>
        <input
          type="text"
          placeholder="johndoe"
          className="w-full p-2 border rounded-lg bg-[#ffffff]"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        </div>
        <div className="mb-3">
          <label className="block text-sm text-gray-600">Password</label>
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded-lg bg-[#ffffff]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        </div>
        <Button className="w-full flex items-center h-10 rounded-lg justify-center" onClick={handleLogin} disabled={loading}>
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
