"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Info, AlertTriangle, CheckCircle, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: number; title: string; message: string; severity: string; is_read: boolean;
  created_at: string; entity_type?: string; entity_id?: number;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  info: Info, success: CheckCircle, warning: AlertTriangle, urgent: AlertOctagon,
};

const COLORS: Record<string, string> = {
  info: "text-blue-600", success: "text-green-600", warning: "text-amber-600", urgent: "text-red-600",
};

export function NotificationSheet() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  async function handleMarkRead(id: number) {
    await fetch("/api/notifications", { method: "POST", body: JSON.stringify({ id }), headers: { "Content-Type": "application/json" } });
    fetchNotifications();
  }

  return (
    <Sheet>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="relative" />}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
            {unreadCount}
          </Badge>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-96">
        <SheetHeader><SheetTitle>Notifikasi ({unreadCount} belum dibaca)</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-2">
          {notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Bell className="mb-2 h-8 w-8" />
              <p className="text-sm">Belum ada notifikasi</p>
            </div>
          )}
          {notifications.map(n => {
            const Icon = ICONS[n.severity] ?? Info;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${n.is_read ? "bg-background" : "bg-muted/50"}`}
                onClick={() => { if (!n.is_read) handleMarkRead(n.id); }}
              >
                <Icon className={`h-4 w-4 mt-0.5 ${COLORS[n.severity] ?? ""}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(n.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                  </p>
                </div>
                {!n.is_read && <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
