
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  activeUser: User | null;
  users: User[];
  login: (userId: User["id"]) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  updateUsers: (updatedUsers: User[]) => void;
  switchUser: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();

  // Initialize users or get from localStorage
  useEffect(() => {
    const storedUsers = localStorage.getItem("2getherLoop_users");
    const storedActiveUserId = localStorage.getItem("2getherLoop_activeUser");
    
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers) as User[];
      setUsers(parsedUsers);
      
      if (storedActiveUserId && parsedUsers.some(u => u.id === storedActiveUserId)) {
        const user = parsedUsers.find(u => u.id === storedActiveUserId);
        if (user) {
          setActiveUser(user);
          setIsLoggedIn(true);
        }
      }
    } else {
      // Default users
      const defaultUsers: User[] = [
        { id: "user_a", name: "Person A" },
        { id: "user_b", name: "Person B" },
      ];
      setUsers(defaultUsers);
      localStorage.setItem("2getherLoop_users", JSON.stringify(defaultUsers));
    }
  }, []);

  const login = (userId: User["id"]) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setActiveUser(user);
      setIsLoggedIn(true);
      localStorage.setItem("2getherLoop_activeUser", userId);
      toast({
        title: "Logged in!",
        description: `Welcome back, ${user.name}!`,
      });
    }
  };

  const logout = () => {
    setActiveUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("2getherLoop_activeUser");
    toast({
      title: "Logged out",
      description: "Come back soon!",
    });
  };

  const updateUser = (updatedUser: User) => {
    const updatedUsers = users.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    );
    setUsers(updatedUsers);
    localStorage.setItem("2getherLoop_users", JSON.stringify(updatedUsers));
    
    if (activeUser?.id === updatedUser.id) {
      setActiveUser(updatedUser);
    }
  };

  const updateUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem("2getherLoop_users", JSON.stringify(updatedUsers));
    
    if (activeUser) {
      const updatedActiveUser = updatedUsers.find(u => u.id === activeUser.id);
      if (updatedActiveUser) {
        setActiveUser(updatedActiveUser);
      }
    }
  };

  const switchUser = () => {
    if (activeUser && users.length === 2) {
      const otherUserId = activeUser.id === "user_a" ? "user_b" : "user_a";
      const otherUser = users.find(u => u.id === otherUserId);
      if (otherUser) {
        setActiveUser(otherUser);
        localStorage.setItem("2getherLoop_activeUser", otherUserId);
        toast({
          title: "Switched user",
          description: `Now logged in as ${otherUser.name}`,
        });
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      activeUser, 
      users, 
      login, 
      logout, 
      updateUser, 
      updateUsers,
      switchUser,
      isLoggedIn
    }}>
      {children}
    </AuthContext.Provider>
  );
};
