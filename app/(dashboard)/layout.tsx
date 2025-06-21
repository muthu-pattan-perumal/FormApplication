// app/(dashboard)/layout.tsx
import { ReactNode } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Header from "@/components/Header"; // Contains <UserButton>, 'use client'

const Layout = async ({ children }: { children: ReactNode }) => {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    // Optional: auto-create the user here instead of redirecting
    // const clerkUser = await currentUser();

    // if (!clerkUser) {
      redirect("/unauthorized"); // CORRECT spelling

    // }

    // await prisma.user.create({
    //   data: {
    //     id: clerkUser.id,
    //     email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
    //     name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
    //   },
    // });
  }

  return (
    <div className="flex max-h-screen min-h-screen min-w-full flex-col bg-background">
      <Header />
      <main className="flex w-full flex-grow">{children}</main>
    </div>
  );
};

export default Layout;
