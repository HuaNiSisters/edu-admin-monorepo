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

const studentsSidebarItems = [
  {
    name: "Search",
    url: "/students/search",
    icon: Search,
  },
  {
    name: "Create",
    url: "/student/create",
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
    url: "/admin/employees",
    icon: IdCard,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenuButton asChild>
          <Link href="/">
            <GraduationCap />
            <span>PEAK Tuition Admin Hub</span>
          </Link>
        </SidebarMenuButton>
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
              Students
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

        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel className="flex justify-between">
              Admin
              <CollapsibleTrigger>
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminSidebarItems.map((item) => (
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
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
