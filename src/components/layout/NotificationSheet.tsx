"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export function NotificationSheet() {
  const unreadCount = 0;

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" />
        }
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
            {unreadCount}
          </Badge>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-96">
        <SheetHeader>
          <SheetTitle>Notifikasi</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Bell className="mb-2 h-8 w-8" />
          <p className="text-sm">Belum ada notifikasi</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
