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
}: SidebarProps) {
  return (
    <aside className="w-[250px] flex-shrink-0 bg-white border-r border-gray-100 flex flex-col z-40 shadow-sm overflow-y-auto">
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

      {/* Logout Button */}
      <div className="px-3 py-4 border-t border-gray-100">
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
