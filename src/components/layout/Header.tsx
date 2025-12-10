import { Phone, LogOut, User, Settings, CreditCard, PhoneCall, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface HeaderProps {
  user: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  } | null;
  onSignOut: () => void;
}

export function Header({ user, onSignOut }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const fullName = user?.user_metadata?.full_name || user?.email || "User";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleProfile = () => {
    toast.info("Profile page coming soon!");
  };

  const handleSettings = () => {
    toast.info("Settings page coming soon!");
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/numbers", label: "Numbers", icon: PhoneCall },
    { href: "/payments", label: "Wallet", icon: CreditCard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-10 h-10 rounded-xl bg-[#0891b2] flex items-center justify-center shadow-lg">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#1a365d]">GlobalConnect</span>
        </div>

        {/* Navigation Links - Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <button
                key={link.href}
                onClick={() => navigate(link.href)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${isActive
                    ? "bg-[#0891b2]/10 text-[#0891b2]"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-[#0891b2] text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border-gray-100 shadow-lg">
            <div className="flex items-center gap-3 p-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-[#0891b2] text-white font-semibold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-semibold text-[#1a365d]">{fullName}</p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-gray-100" />

            {/* Mobile Nav Links */}
            <div className="md:hidden">
              {navLinks.map((link) => (
                <DropdownMenuItem
                  key={link.href}
                  onClick={() => navigate(link.href)}
                  className="cursor-pointer"
                >
                  <link.icon className="mr-2 h-4 w-4 text-gray-500" />
                  {link.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-gray-100" />
            </div>

            <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
              <User className="mr-2 h-4 w-4 text-gray-500" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4 text-gray-500" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-100" />
            <DropdownMenuItem onClick={onSignOut} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}