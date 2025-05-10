
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Menu, 
  Home, 
  CalendarDays, 
  History as HistoryIcon, 
  LogOut, 
  StickyNote,
  BarChart2,
  PieChart,
  LineChart,
  Activity,
  Clock,
  Medal,
  Settings as SettingsIcon,
  User,
  ArrowLeftRight,
  Image
} from "lucide-react";

const Header: React.FC = () => {
  const { activeUser, logout, switchUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/1431f3f2-33e9-448e-95bc-c31245063ba3.png" 
              alt="BitBuddies logo" 
              className="h-9 w-auto" 
            />
            <span className="text-xl font-bold gradient-heading">BitBuddies</span>
          </div>
        </Link>

        {!isMobile ? (
          <nav className="hidden md:flex items-center space-x-1">
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              size="sm"
              className="neumorph"
              asChild
            >
              <Link to="/">
                <Home className="h-4 w-4 mr-2" /> Dashboard
              </Link>
            </Button>
            <Button
              variant={isActive("/history") ? "default" : "ghost"}
              size="sm"
              className="neumorph"
              asChild
            >
              <Link to="/history">
                <HistoryIcon className="h-4 w-4 mr-2" /> History
              </Link>
            </Button>
            <Button
              variant={isActive("/notes") ? "default" : "ghost"}
              size="sm"
              className="neumorph"
              asChild
            >
              <Link to="/notes">
                <StickyNote className="h-4 w-4 mr-2" /> Notes
              </Link>
            </Button>
            <Button
              variant={isActive("/gallery") ? "default" : "ghost"}
              size="sm"
              className="neumorph"
              asChild
            >
              <Link to="/gallery">
                <Image className="h-4 w-4 mr-2" /> Gallery
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`neumorph ${
                    isActive("/comparison") ||
                    isActive("/timeline") ||
                    isActive("/weekly-spend") ||
                    isActive("/study") ||
                    isActive("/gym") ||
                    isActive("/milestones")
                      ? "bg-muted"
                      : ""
                  }`}
                >
                  <BarChart2 className="h-4 w-4 mr-2" /> Analytics
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="neumorph bg-card">
                <DropdownMenuItem onClick={() => navigate("/comparison")}>
                  <PieChart className="h-4 w-4 mr-2" /> Partner Comparison
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/timeline")}>
                  <CalendarDays className="h-4 w-4 mr-2" /> Pact Timeline
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/weekly-spend")}>
                  <LineChart className="h-4 w-4 mr-2" /> Weekly Spending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/study")}>
                  <Clock className="h-4 w-4 mr-2" /> Study Tracker
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/gym")}>
                  <Activity className="h-4 w-4 mr-2" /> Gym Tracker
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/milestones")}>
                  <Medal className="h-4 w-4 mr-2" /> Milestones
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        ) : (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px] p-0">
              <SheetHeader className="p-6 pb-2">
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>Navigate the app</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col pt-2">
                <SheetClose asChild>
                  <Button
                    variant={isActive("/") ? "default" : "ghost"}
                    className="justify-start rounded-none h-14"
                    asChild
                  >
                    <Link to="/">
                      <Home className="h-5 w-5 mr-3" /> Dashboard
                    </Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant={isActive("/history") ? "default" : "ghost"}
                    className="justify-start rounded-none h-14"
                    asChild
                  >
                    <Link to="/history">
                      <HistoryIcon className="h-5 w-5 mr-3" /> History
                    </Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant={isActive("/notes") ? "default" : "ghost"}
                    className="justify-start rounded-none h-14"
                    asChild
                  >
                    <Link to="/notes">
                      <StickyNote className="h-5 w-5 mr-3" /> Notes
                    </Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant={isActive("/gallery") ? "default" : "ghost"}
                    className="justify-start rounded-none h-14"
                    asChild
                  >
                    <Link to="/gallery">
                      <Image className="h-5 w-5 mr-3" /> Media Gallery
                    </Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant={isActive("/comparison") ? "default" : "ghost"}
                    className="justify-start rounded-none h-14"
                    asChild
                  >
                    <Link to="/comparison">
                      <PieChart className="h-5 w-5 mr-3" /> Partner Comparison
                    </Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant={isActive("/timeline") ? "default" : "ghost"}
                    className="justify-start rounded-none h-14"
                    asChild
                  >
                    <Link to="/timeline">
                      <CalendarDays className="h-5 w-5 mr-3" /> Pact Timeline
                    </Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant={isActive("/weekly-spend") ? "default" : "ghost"}
                    className="justify-start rounded-none h-14"
                    asChild
                  >
                    <Link to="/weekly-spend">
                      <LineChart className="h-5 w-5 mr-3" /> Weekly Spending
                    </Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant={isActive("/study") ? "default" : "ghost"}
                    className="justify-start rounded-none h-14"
                    asChild
                  >
                    <Link to="/study">
                      <Clock className="h-5 w-5 mr-3" /> Study Tracker
                    </Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant={isActive("/gym") ? "default" : "ghost"}
                    className="justify-start rounded-none h-14"
                    asChild
                  >
                    <Link to="/gym">
                      <Activity className="h-5 w-5 mr-3" /> Gym Tracker
                    </Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant={isActive("/milestones") ? "default" : "ghost"}
                    className="justify-start rounded-none h-14"
                    asChild
                  >
                    <Link to="/milestones">
                      <Medal className="h-5 w-5 mr-3" /> Milestones
                    </Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant={isActive("/settings") ? "default" : "ghost"}
                    className="justify-start rounded-none h-14"
                    asChild
                  >
                    <Link to="/settings">
                      <SettingsIcon className="h-5 w-5 mr-3" /> Settings
                    </Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        )}

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 neumorph">
                <Avatar className="h-8 w-8 bg-bit-purple text-white">
                  <AvatarFallback className="bg-gradient-to-br from-bit-purple to-bit-pink text-white">
                    {activeUser?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">{activeUser?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="neumorph bg-card">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <SettingsIcon className="h-4 w-4 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchUser()}>
                <ArrowLeftRight className="h-4 w-4 mr-2" /> Switch User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                <LogOut className="h-4 w-4 mr-2" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
