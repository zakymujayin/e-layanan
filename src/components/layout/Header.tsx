import { SignOutButton } from "./SignOutButton";
import { NotificationSheet } from "./NotificationSheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header({ userName }: { userName: string }) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="flex h-14 items-center gap-4 border-b px-6">
      <div className="flex-1" />
      <NotificationSheet />
      <SignOutButton />
      <Avatar className="h-8 w-8">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    </header>
  );
}
