"use client";

import {
  Sidebar,
  SidebarGroupContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarMenuItem,
  SidebarMenu,
  SidebarMenuButton,
  SidebarContent,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import Link from "next/link";

import {
  Home,
  Search,
  Plus,
  UserCheck,
  CircleDollarSign,
  HandCoins,
  MessageCircleQuestion,
  Users,
  BookOpenText,
  GraduationCap,
  MessageSquareMore,
  IdCard,
  ChevronDown,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { RECEPTION_ADMIN_ROUTES, ROUTES } from "@/core/routes/consts";

const studentsSidebarItems = [
  {
    name: "Search",
    url: "/students/search",
    icon: Search,
  },
  {
    name: "Create",
    url: "/students/create",
    icon: Plus,
  },
  {
    name: "Attendance",
    url: "/students/attendance",
    icon: UserCheck,
  },
  {
    name: "Payments",
    url: "/students/payments",
    icon: CircleDollarSign,
  },
  {
    name: "Owings",
    url: "/students/owings",
    icon: HandCoins,
  },
  {
    name: "Enquiries",
    url: "/students/enquiries",
    icon: MessageCircleQuestion,
  },
];

const adminSidebarItems = [
  {
    name: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    name: "Subjects",
    url: "/admin/subjects",
    icon: BookOpenText,
  },
  {
    name: "Classes",
    url: "/admin/classes",
    icon: GraduationCap,
  },
  {
    name: "SMS Templates",
    url: "/admin/sms-templates",
    icon: MessageSquareMore,
  },
  {
    name: "Employees",
    url: ROUTES.ADMIN.EMPLOYEES,
    icon: IdCard,
  },
];

export function AppSidebar() {
  const { isUserAdmin, isUserReceptionist } = useAuth();
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      {/* Header / Logo */}
      <SidebarHeader className="bg-[#0A0A09] border-b border-white/[0.07]">
        <SidebarMenu>
          <SidebarMenuItem key="home">
            <SidebarMenuButton asChild className="hover:bg-[#0A0A09]">
              <Link href="/">
                <div className="w-6 h-6 rounded-lg bg-[#2D6A4F] flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[15px] font-medium text-white tracking-[0.01em]">
                    PEAK Tuition
                  </span>
                  <span className="text-[10px] text-white/30 tracking-[0.12em] uppercase font-normal">
                    Admin Hub
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key="home">
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link href="/">
                    <Home />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel className="flex justify-between">
              STUDENTS
              <CollapsibleTrigger>
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {studentsSidebarItems.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                      >
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {(isUserAdmin() || isUserReceptionist()) && (
          <>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarGroup>
                <SidebarGroupLabel className="flex justify-between">
                  ADMIN
                  <CollapsibleTrigger>
                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {adminSidebarItems
                        .filter((item) => {
                          if (isUserAdmin()) return true;
                          if (
                            isUserReceptionist() &&
                            RECEPTION_ADMIN_ROUTES.includes(item.url)
                          ) {
                            return true;
                          }
                          return false;
                        })
                        .map((item) => (
                          <SidebarMenuItem key={item.name}>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname === item.url}
                            >
                              <Link href={item.url}>
                                <item.icon />
                                <div>{item.name}</div>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          </>
        )}
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
