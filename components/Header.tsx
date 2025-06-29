'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import ThemeSwitcher from './ThemeSwitcher';
import Logo from './Logo';
import { Button } from "./ui/button";
type UserType = {
  email?: string;
  name?: string;
};

export default function Header({ user }: { user: UserType }) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/sign-in');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="flex h-[60px] items-center justify-between border-b border-border px-4 py-2 relative">
      <Logo />
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        <ThemeSwitcher />
        {/* <button
          onClick={() => setShowMenu(prev => !prev)}
          className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
        >
          Account
        </button> */}

        <Button
          className=""
          onClick={() => setShowMenu(prev => !prev)}
        >
          Account
        </Button>
        {showMenu && (
          <div className="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded shadow-md z-50">
            <div className="px-4 py-2 border-b font-semibold text-black">Account</div>
            <div className="flex items-center px-4 py-2 text-sm text-gray-700">
              <FaUser className="mr-2 text-gray-500" />
              {user?.email || 'No email'}
            </div>
            <div className="flex items-center px-4 py-2 text-sm text-gray-700">
              <FaUser className="mr-2 text-gray-500" />
              {user?.name || 'No name'}
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
