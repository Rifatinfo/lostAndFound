import {
  LayoutDashboardIcon,
  BarChart3,
 
  SettingsIcon,
  ShieldCheckIcon,

  SearchIcon,
  UserCogIcon,

} from "lucide-react";
import { UserRole } from "@/types/role";


export type NavItem = {
  id: string;
  label: string;
  icon: any;
  roles: UserRole[];
  path?: string;
};

// =====================
// Dashboard Section
// =====================
export const NAV_MAIN: NavItem[] = [
  {
    id: "overview",
    label: "Sales Overview",
    icon: LayoutDashboardIcon,
    roles: ["ADMIN", "SHOP_MANAGER", "MEDIA_MANAGER"],
    path: "/admin",
  },

  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    roles: ["ADMIN"],
    path: "/admin/analytics",
  }
];

// =====================
// More Section
// =====================
export const NAV_SECONDARY: NavItem[] = [
  {
    id: "settings",
    label: "Settings",
    icon: SettingsIcon,
    roles: ["ADMIN", "SHOP_MANAGER", "MEDIA_MANAGER"],
    path: "/dashboard/settings",
  },

  {
    id: "help-center",
    label: "Help Center",
    icon: SearchIcon,
    roles: ["ADMIN", "SHOP_MANAGER", "MEDIA_MANAGER"],
    path: "/dashboard/search",
  },
];

// =====================
// Role Specific Section
// =====================
export const NAV_ROLE: NavItem[] = [
  // =====================
  // ADMIN
  // =====================
  {
    id: "admin-create",
    label: "Admin Role",
    icon: UserCogIcon,
    roles: ["ADMIN"],
    path: "/admin/create-admin",
  },

  {
    id: "control-authority",
    label: "Control Authority",
    icon: ShieldCheckIcon,
    roles: ["ADMIN"],
    path: "/admin/control-authority",
  },
  {
    id: "add-admin",
    label: "Add Admin",
    icon: ShieldCheckIcon,
    roles: ["ADMIN", "SHOP_MANAGER"],
    path: "/admin/add-admin",
  },

];
