import { SignOutButton } from "./SignOutButton";
import { NotificationSheet } from "./NotificationSheet";
import { ThemeToggle } from "./ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import React from "react";

export function Header({ userName, slot }: { userName: string; slot?: React.ReactNode }) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
      <SidebarTrigger className="-ml-2 sm:hidden" />
      {slot && <div className="hidden sm:flex items-center">{slot}</div>}
      <div className="flex-1" />
      {slot && <div className="flex sm:hidden items-center">{slot}</div>}
      <ThemeToggle />
      <NotificationSheet />
      <SignOutButton />
      <Avatar className="h-8 w-8">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    </header>
  );
}
