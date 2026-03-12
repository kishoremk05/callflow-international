import {
  MdDashboard,
  MdPhone,
  MdGroups,
  MdHistory,
  MdCalendarMonth,
  MdDialpad,
  MdAdminPanelSettings,
  MdLogout,
} from "react-icons/md";
import { Phone, User, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export type SidebarView =
  | "overview"
  | "voice-call"
  | "recent-calls"
  | "calendar"
  | "numbers"
  | "admin";

interface SidebarProps {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
  onLogout: () => void;
  showAdmin?: boolean;
  user?: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  } | null;
}

const navItems: {
  id: SidebarView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "overview", label: "Dashboard", icon: MdDashboard },
  { id: "voice-call", label: "Team Call", icon: MdGroups },
  { id: "recent-calls", label: "Recent Calls", icon: MdHistory },
  { id: "calendar", label: "Meeting Calendar", icon: MdCalendarMonth },
  { id: "numbers", label: "Numbers", icon: MdDialpad },
  { id: "admin", label: "Admin Access", icon: MdAdminPanelSettings },
];

export function Sidebar({
  activeView,
  onViewChange,
  onLogout,
  showAdmin = true,
  user,
}: SidebarProps) {
  const fullName = user?.user_metadata?.full_name || user?.email || "User";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="w-[250px] flex-shrink-0 bg-white border-r border-gray-100 flex flex-col z-40 shadow-sm">
      {/* Logo / Brand */}
      <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0891b2] flex items-center justify-center shadow-md flex-shrink-0">
            <Phone className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-[#1a365d]">
            GlobalConnect
          </span>
        </div>
      </div>
      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems
          .filter((item) => item.id !== "admin" || showAdmin)
          .map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#0891b2]/10 text-[#0891b2] shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon
                  className={`text-xl flex-shrink-0 ${
                    isActive ? "text-[#0891b2]" : "text-gray-500"
                  }`}
                />
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0891b2]" />
                )}
              </button>
            );
          })}
      </nav>

      {/* Profile + Logout */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full hover:bg-gray-50 rounded-xl px-4 py-3 transition-all">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-[#0891b2] text-white font-semibold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-sm font-semibold text-[#1a365d] truncate">
                  {fullName}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  {user?.email}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-56 bg-white border-gray-100 shadow-lg"
          >
            <DropdownMenuItem
              onClick={() => toast.info("Profile page coming soon!")}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4 text-gray-500" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toast.info("Settings page coming soon!")}
              className="cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4 text-gray-500" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
        >
          <MdLogout className="text-xl flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
