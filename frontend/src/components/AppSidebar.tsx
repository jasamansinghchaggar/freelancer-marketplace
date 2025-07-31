import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  RiHome4Line,
  RiAddBoxLine,
  RiSearchLine,
  RiUser3Line,
  RiLogoutBoxLine,
  RiBriefcase4Line,
  RiMessage3Line,
  RiShoppingCartLine,
  RiMoneyRupeeCircleLine
} from '@remixicon/react';
import { toast } from 'sonner';
import { useUnread } from '@/context/UnreadContext';

const AppSidebar: React.FC = () => {
  const { user, signout } = useAuth();
  const { unreadChats } = useUnread();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    signout();
    toast.success('Logged out successfully!');
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    {
      title: 'Home',
      icon: RiHome4Line,
      path: '/home',
      onClick: () => navigate('/home'),
    },
    {
      title: 'Browse Gigs',
      icon: RiSearchLine,
      path: '/gigs',
      onClick: () => navigate('/gigs'),
    },
  ];

  const roleBasedItems = user?.role === 'freelancer'
    ? [
      {
        title: 'Sales',
        icon: RiMoneyRupeeCircleLine,
        path: '/sales',
        onClick: () => navigate('/sales'),
      },
      {
        title: 'Create Gig',
        icon: RiAddBoxLine,
        path: '/gigs/new',
        onClick: () => navigate('/gigs/new'),
      },
      {
        title: 'My Gigs',
        icon: RiBriefcase4Line,
        path: '/my-gigs',
        onClick: () => navigate('/my-gigs'),
      },
    ]
    : user?.role === 'client'
      ? [
        {
          title: 'Purchased Gigs',
          icon: RiShoppingCartLine,
          path: '/purchased-gigs',
          onClick: () => navigate('/purchased-gigs'),
        },
      ]
      : [];

  const accountItems = [
    {
      title: 'Messages',
      icon: RiMessage3Line,
      path: '/messages',
      onClick: () => navigate('/messages'),
    },
    {
      title: 'Profile',
      icon: RiUser3Line,
      path: '/profile',
      onClick: () => navigate('/profile'),
    },
  ];

  return (
    <Sidebar className="border-border overflow-y-hidden" collapsible="icon">
      <SidebarContent className="bg-background">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={item.onClick}
                    className={`transition-colors ${isActive(item.path)
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50'
                      }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Role-based Actions */}
        {roleBasedItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground">
              {user?.role === 'freelancer' ? 'Freelancer' : 'Client'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {roleBasedItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={item.onClick}
                      className={`transition-colors ${isActive(item.path)
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                        }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Account */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={item.onClick}
                    className={`transition-colors relative ${isActive(item.path)
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50'
                      }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="ml-2">{item.title}</span>
                    {item.title === 'Messages' && unreadChats.size > 0 && (
                      <span className="absolute top-1/2 right-3 transform -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full z-20" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Logout button */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <RiLogoutBoxLine className="w-4 h-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
