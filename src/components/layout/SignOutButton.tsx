"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        await signOut({ redirectTo: "/login" });
      }}
    >
      <Button variant="ghost" size="icon" type="submit">
        <LogOut className="h-4 w-4" />
      </Button>
    </form>
  );
}
