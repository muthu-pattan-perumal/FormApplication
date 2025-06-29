// app/(dashboard)/layout.tsx
import { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth"; // ✅ your custom auth method
import { redirect } from "next/navigation";
import Header from "@/components/Header";

const Layout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex max-h-screen min-h-screen min-w-full flex-col bg-background" style={{width:"100%"}}>
      <Header user={user} />
      <main className="flex w-full flex-grow">{children}</main>
    </div>
  );
};

export default Layout;
