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
import { User, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import BrandLogo from "@/components/branding/BrandLogo";

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
  userType?: "normal" | "company" | "company_admin" | null;
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
  userType,
  user,
}: SidebarProps) {
  const fullName = user?.user_metadata?.full_name || user?.email || "User";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const hiddenForNormalUsers: SidebarView[] = [
    "voice-call",
    "calendar",
    "numbers",
  ];

  return (
    <aside className="w-[250px] flex-shrink-0 bg-[#0f141d] border-r border-yellow-500/10 flex flex-col z-40 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
      {/* Logo / Brand */}
      <div className="px-5 py-4 border-b border-yellow-500/10 flex-shrink-0">
        <BrandLogo
          iconClassName="text-yellow-400"
          textClassName="text-xl font-bold text-zinc-100"
        />
      </div>
      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems
          .filter((item) => item.id !== "admin" || showAdmin)
          .filter(
            (item) =>
              userType !== "normal" || !hiddenForNormalUsers.includes(item.id),
          )
          .map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-yellow-500/12 text-yellow-300 shadow-sm"
                    : "text-zinc-400 hover:bg-[#171d28] hover:text-zinc-100"
                }`}
              >
                <item.icon
                  className={`text-xl flex-shrink-0 ${
                    isActive ? "text-yellow-300" : "text-zinc-500"
                  }`}
                />
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-400" />
                )}
              </button>
            );
          })}
      </nav>

      {/* Profile + Logout */}
      <div className="px-3 py-4 border-t border-yellow-500/10 space-y-1">
        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full hover:bg-[#171d28] rounded-xl px-4 py-3 transition-all">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-amber-500 text-white font-semibold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-sm font-semibold text-zinc-100 truncate">
                  {fullName}
                </span>
                <span className="text-xs text-zinc-500 truncate">
                  {user?.email}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-56 bg-[#141a24] border-yellow-500/15 text-zinc-100 shadow-lg"
          >
            <DropdownMenuItem
              onClick={() => toast.info("Profile page coming soon!")}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4 text-zinc-500" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toast.info("Settings page coming soon!")}
              className="cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4 text-zinc-500" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-150"
        >
          <MdLogout className="text-xl flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
