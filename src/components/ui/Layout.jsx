import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, BookOpen, Award, User, Globe } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "首页",
    url: createPageUrl("Home"),
    icon: Home,
  },
  {
    title: "课程学习",
    url: createPageUrl("Courses"),
    icon: BookOpen,
  },
  {
    title: "奖励商城",
    url: createPageUrl("Rewards"),
    icon: Award,
  },
  {
    title: "个人中心",
    url: createPageUrl("Profile"),
    icon: User,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar className="hidden lg:flex">
          <SidebarHeader>
            <Link to={createPageUrl("Home")} className="flex items-center gap-2 px-4 py-2">
              <Globe className="h-6 w-6 text-purple-600" />
              <span className="text-lg font-bold text-gray-800">CultureBridge</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarGroup>
                <SidebarGroupLabel>导航</SidebarGroupLabel>
                <SidebarGroupContent>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title} asChild>
                      <Link
                        to={item.url}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-200 ${
                          location.pathname === item.url
                            ? "bg-purple-100 text-purple-700 font-semibold"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.title}
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="p-4 text-sm text-gray-500">
              © 2025 CultureBridge. All rights reserved.
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar for Mobile */}
          <header className="lg:hidden sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4">
            <SidebarTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Globe className="h-5 w-5" />
                <span className="sr-only">Toggle navigation</span>
              </Button>
            </SidebarTrigger>
            <Link to={createPageUrl("Home")} className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-800">CultureBridge</span>
            </Link>
            <div className="flex-1"></div>
            {/* Add user menu/auth buttons here if needed */}
          </header>

          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

