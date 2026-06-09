import { SignOutButton } from "./SignOutButton";
import { NotificationSheet } from "./NotificationSheet";
import { ThemeToggle } from "./ThemeToggle";
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
    <header className="flex h-14 items-center gap-2 border-b px-6">
      {slot && <div className="flex items-center">{slot}</div>}
      <div className="flex-1" />
      <ThemeToggle />
      <NotificationSheet />
      <SignOutButton />
      <Avatar className="h-8 w-8">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    </header>
  );
}
