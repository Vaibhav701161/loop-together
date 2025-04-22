
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  activeUser: User | null;
  users: User[];
  login: (userId: User["id"]) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  updateUsers: (updatedUsers: User[]) => void;
  switchUser: () => void;
  isLoggedIn: boolean;
  emailLogin: (email: string, password: string) => Promise<void>;
  emailSignup: (email: string, password: string, name: string, userType: "user_a" | "user_b") => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize users or get from localStorage
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      
      try {
        // Check current auth session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get profile from database
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error) throw error;
          
          // Get all profiles for the relationship
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*');
            
          if (profilesError) throw profilesError;
          
          // Convert to our app's user format
          const appUsers: User[] = profiles.map(p => ({
            id: p.user_type || 'user_a',
            name: p.name,
            avatar: p.avatar_url || undefined
          }));
          
          // Set active user
          const appUser: User = {
            id: profile.user_type || 'user_a',
            name: profile.name,
            avatar: profile.avatar_url || undefined
          };
          
          setUsers(appUsers);
          setActiveUser(appUser);
          setIsLoggedIn(true);
        } else {
          // Fallback to localStorage if not authenticated
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
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        
        // Fallback to localStorage if there's an error
        const storedUsers = localStorage.getItem("2getherLoop_users");
        if (storedUsers) {
          setUsers(JSON.parse(storedUsers));
        } else {
          const defaultUsers: User[] = [
            { id: "user_a", name: "Person A" },
            { id: "user_b", name: "Person B" },
          ];
          setUsers(defaultUsers);
          localStorage.setItem("2getherLoop_users", JSON.stringify(defaultUsers));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Fetch user profile after sign in
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (!error && profile) {
          const appUser: User = {
            id: profile.user_type || 'user_a',
            name: profile.name,
            avatar: profile.avatar_url || undefined
          };
          
          setActiveUser(appUser);
          setIsLoggedIn(true);
          
          // Update users list
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*');
            
          if (profiles) {
            const appUsers: User[] = profiles.map(p => ({
              id: p.user_type || 'user_a',
              name: p.name,
              avatar: p.avatar_url || undefined
            }));
            
            setUsers(appUsers);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setActiveUser(null);
        setIsLoggedIn(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const emailLogin = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast({
        title: "Signed in",
        description: "You have successfully signed in!"
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "There was an error signing in. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const emailSignup = async (email: string, password: string, name: string, userType: "user_a" | "user_b") => {
    try {
      // Create auth user
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (signUpError) throw signUpError;
      if (!user) throw new Error("User creation failed");
      
      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        name,
        user_type: userType
      });
      
      if (profileError) throw profileError;
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully!"
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error.message || "There was an error creating your account. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

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

  const logout = async () => {
    try {
      // Sign out from Supabase if authenticated
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Update local state
      setActiveUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem("2getherLoop_activeUser");
      
      toast({
        title: "Logged out",
        description: "Come back soon!",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error logging out",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      // Get the Supabase user ID for this app user
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_type', updatedUser.id)
        .single();
        
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      if (profile) {
        // Update the profile in Supabase
        const { error } = await supabase
          .from('profiles')
          .update({
            name: updatedUser.name,
            avatar_url: updatedUser.avatar
          })
          .eq('id', profile.id);
          
        if (error) throw error;
      }
      
      // Update local state regardless
      const updatedUsers = users.map(u => 
        u.id === updatedUser.id ? updatedUser : u
      );
      setUsers(updatedUsers);
      localStorage.setItem("2getherLoop_users", JSON.stringify(updatedUsers));
      
      if (activeUser?.id === updatedUser.id) {
        setActiveUser(updatedUser);
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error updating profile",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive"
      });
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
      isLoggedIn,
      emailLogin,
      emailSignup
    }}>
      {children}
    </AuthContext.Provider>
  );
};
