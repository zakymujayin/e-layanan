import { SignOutButton } from "./SignOutButton";
import { NotificationSheet } from "./NotificationSheet";
import { ThemeToggle } from "./ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import React from "react";

interface HeaderProps {
  userName: string;
  slot?: React.ReactNode;
  roleLabel?: string;
  prodiName?: string;
}

export function Header({ userName, slot, roleLabel, prodiName }: HeaderProps) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-6">
      <SidebarTrigger className="-ml-1 sm:hidden" />

      {/* Role identity (desktop) */}
      <div className="hidden sm:flex items-center gap-2">
        {slot}
        {roleLabel && (
          <Badge variant="outline" className="font-normal text-xs">{roleLabel}</Badge>
        )}
        {prodiName && (
          <span className="text-xs text-muted-foreground hidden md:inline">{prodiName}</span>
        )}
      </div>

      {/* Role identity (mobile) */}
      <div className="flex sm:hidden items-center gap-1.5 flex-1 min-w-0">
        {slot}
        {roleLabel && (
          <span className="text-xs text-muted-foreground truncate">{roleLabel}</span>
        )}
      </div>

      <div className="hidden sm:flex flex-1" />
      <ThemeToggle />
      <NotificationSheet />
      <SignOutButton />
      <Avatar className="h-8 w-8 ring-1 ring-primary/20">
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials}</AvatarFallback>
      </Avatar>
    </header>
  );
}
