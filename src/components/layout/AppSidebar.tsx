
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Star,
  Rocket,
  FileCode,
  Settings,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

const AppSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);

  return (
    <aside
      className={`${
        isCollapsed ? "w-16" : "w-64"
      } bg-background border-r border-border transition-all duration-300 hidden md:block`}
    >
      <div className="flex flex-col h-full p-2">
        <div className="flex justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="space-y-1 flex-1">
          <NavItem
            to="/"
            icon={<Search className="h-4 w-4" />}
            label="Discover"
            isCollapsed={isCollapsed}
          />
          <NavItem
            to="/dashboard"
            icon={<LayoutDashboard className="h-4 w-4" />}
            label="Dashboard"
            isCollapsed={isCollapsed}
          />
          <NavItem
            to="/favorites"
            icon={<Star className="h-4 w-4" />}
            label="Favorites"
            isCollapsed={isCollapsed}
          />

          {!isCollapsed && (
            <Collapsible
              open={isCategoryOpen}
              onOpenChange={setIsCategoryOpen}
              className="w-full"
            >
              <div className="flex items-center px-3 py-2 text-muted-foreground">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        isCategoryOpen ? "transform rotate-90" : ""
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <span className="ml-2 text-sm font-medium">Categories</span>
              </div>
              <CollapsibleContent className="pl-8 space-y-1">
                <NavItem
                  to="/category/writing"
                  icon={null}
                  label="Writing"
                  isCollapsed={false}
                />
                <NavItem
                  to="/category/design"
                  icon={null}
                  label="Design"
                  isCollapsed={false}
                />
                <NavItem
                  to="/category/marketing"
                  icon={null}
                  label="Marketing"
                  isCollapsed={false}
                />
                <NavItem
                  to="/category/development"
                  icon={null}
                  label="Development"
                  isCollapsed={false}
                />
                <NavItem
                  to="/category/analysis"
                  icon={null}
                  label="Analysis"
                  isCollapsed={false}
                />
              </CollapsibleContent>
            </Collapsible>
          )}

          <div className="mt-4 pt-4 border-t border-border">
            <NavItem
              to="/developer"
              icon={<FileCode className="h-4 w-4" />}
              label="Developer Tools"
              isCollapsed={isCollapsed}
              highlight
            />
            <NavItem
              to="/settings"
              icon={<Settings className="h-4 w-4" />}
              label="Settings"
              isCollapsed={isCollapsed}
            />
          </div>
        </nav>

        {!isCollapsed && (
          <div className="mt-auto p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center">
              <Rocket className="h-5 w-5 text-primary" />
              <div className="ml-3">
                <p className="text-xs font-medium">Publish your AI tool</p>
                <p className="text-xs text-muted-foreground">Reach thousands of users!</p>
              </div>
            </div>
            <Button size="sm" className="w-full mt-2">
              Get Started
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  highlight?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  to,
  icon,
  label,
  isCollapsed,
  highlight = false,
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-3 py-2 rounded-md transition-colors ${
          isActive
            ? "bg-primary/10 text-primary"
            : "text-foreground hover:bg-muted"
        } ${highlight ? "text-primary font-medium" : ""}`
      }
    >
      {icon}
      {!isCollapsed && <span className="ml-2 text-sm">{label}</span>}
    </NavLink>
  );
};

export default AppSidebar;
