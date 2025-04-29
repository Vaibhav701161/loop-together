
import { Link } from "react-router-dom";
import { Github } from "lucide-react";

const AppFooter = () => {
  return (
    <footer className="bg-background border-t border-border py-6 px-4 md:px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-1">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <span className="text-xl font-bold gradient-heading">ToolKart</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Discover, Use, and Monetize AI Tools - All in One Place
            </p>
            <div className="flex space-x-4">
              <Link 
                to="#"
                className="text-muted-foreground hover:text-foreground"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">For Users</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground">
                  Browse Tools
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-muted-foreground hover:text-foreground">
                  Favorites
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-muted-foreground hover:text-foreground">
                  Account Settings
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">For Developers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/developer" className="text-muted-foreground hover:text-foreground">
                  Developer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/developer/publish" className="text-muted-foreground hover:text-foreground">
                  Publish a Tool
                </Link>
              </li>
              <li>
                <Link to="/developer/analytics" className="text-muted-foreground hover:text-foreground">
                  Tool Analytics
                </Link>
              </li>
              <li>
                <Link to="/developer/documentation" className="text-muted-foreground hover:text-foreground">
                  API Documentation
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Stay updated with the latest AI tools and features
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              />
              <button className="bg-primary text-primary-foreground rounded-md px-3 py-1 text-sm">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} AI ToolKart. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link to="/contact" className="hover:text-foreground">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
