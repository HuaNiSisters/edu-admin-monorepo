import {
  Sidebar,
  SidebarGroupContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarMenuItem,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Link from "next/link";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import PaymentsIcon from "@mui/icons-material/Payments";
import EventNoteIcon from "@mui/icons-material/EventNote";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SmsIcon from "@mui/icons-material/Sms";
import BadgeIcon from "@mui/icons-material/Badge";
import HomeIcon from "@mui/icons-material/Home";

const studentsSidebarItems = [
  {
    name: "Search",
    url: "students/search",
    icon: <SearchIcon />,
  },
  {
    name: "Create",
    url: "students/create",
    icon: <AddIcon />,
  },
  {
    name: "Attendance",
    url: "students/attendance",
    icon: <HowToRegIcon />,
  },
  {
    name: "Payments",
    url: "students/payments",
    icon: <PaymentsIcon />,
  },
  {
    name: "Owings",
    url: "students/owings",
    icon: <EventNoteIcon />,
  },
  {
    name: "Enquiries",
    url: "students/enquiries",
    icon: <HelpOutlineIcon />,
  },
];

const adminSidebarItems = [
  {
    name: "Users",
    url: "admin/users",
    icon: <PersonOutlineIcon />,
  },
  {
    name: "Subjects",
    url: "admin/subjects",
    icon: <MenuBookIcon />,
  },
  {
    name: "SMS Templates",
    url: "admin/sms-templates",
    icon: <SmsIcon />,
  },
  {
    name: "Employees",
    url: "admin/employees",
    icon: <BadgeIcon />,
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="p-4">
      <SidebarHeader>PEAK Tuition Admin Hub</SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem key="home">
          <SidebarMenuButton asChild>
            <Link href="/">
              <HomeIcon />
              <div>Home</div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarGroup>
          <SidebarGroupLabel>Students</SidebarGroupLabel>
          {studentsSidebarItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild>
                <Link href={item.url}>
                  {item.icon}
                  <div>{item.name}</div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          {adminSidebarItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild>
                <Link href={item.url}>
                  {item.icon}
                  <div>{item.name}</div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarGroup>
      </SidebarMenu>
      <SidebarFooter />
    </Sidebar>
  );
}
