"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from 'next/navigation';
function VisitBtn({ shareURL }: { shareURL: string }) {
  const [mounted, isMounted] = useState(false);
 const router = useRouter();
  useEffect(() => {
    isMounted(true);
  }, []);

  if (!mounted) return null;

  const shareLink = `${window.location.origin}/submit/${shareURL}`;

  return (
    <>
     <Button
      className="w-[200px]"
      onClick={() =>  router.push('/dashboard')}
    >
      Go To Dashboard
    </Button>
    <Button
      className="w-[200px]"
      onClick={() => window.open(shareLink, "_blank")}
    >
      Visit
    </Button></>
  );
}

export default VisitBtn;
