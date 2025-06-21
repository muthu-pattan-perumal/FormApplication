// components/Header.tsx
'use client';

import { UserButton } from "@clerk/nextjs";
import Logo from "./Logo";
import ThemeSwitcher from "./ThemeSwitcher";

const Header = () => (
  <nav className="flex h-[60px] items-center justify-between border-b border-border px-4 py-2">
    <Logo />
    <div className="flex items-center gap-4">
      <ThemeSwitcher />
      <UserButton afterSignOutUrl="/sign-in" />
    </div>
  </nav>
);

export default Header;
