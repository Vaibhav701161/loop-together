
import React, { createContext, useContext, useState, useEffect } from "react";
import { Note, User } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface NotesContextType {
  notes: Note[];
  addNote: (note: Omit<Note, "id" | "createdAt">) => void;
  deleteNote: (noteId: string) => void;
  getUserNotes: (userId: User["id"]) => Note[];
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
};

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const { toast } = useToast();

  // Load notes from localStorage
  useEffect(() => {
    const storedNotes = localStorage.getItem("2getherLoop_notes");
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    }
  }, []);

  // Save notes to localStorage when they change
  useEffect(() => {
    localStorage.setItem("2getherLoop_notes", JSON.stringify(notes));
  }, [notes]);

  const addNote = (noteData: Omit<Note, "id" | "createdAt">) => {
    const newNote: Note = {
      ...noteData,
      id: `note_${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    
    setNotes(prev => [...prev, newNote]);
    
    toast({
      title: "Note Added! 📝",
      description: "Your note has been added to the wall.",
    });
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    
    toast({
      title: "Note Removed",
      description: "The note has been removed from the wall.",
    });
  };

  const getUserNotes = (userId: User["id"]): Note[] => {
    return notes.filter(note => note.toUserId === userId);
  };

  return (
    <NotesContext.Provider value={{ 
      notes,
      addNote,
      deleteNote,
      getUserNotes,
    }}>
      {children}
    </NotesContext.Provider>
  );
};
