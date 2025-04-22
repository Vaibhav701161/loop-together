import React, { createContext, useContext, useState, useEffect } from "react";
import { Note } from "@/types";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

interface NotesContextType {
  notes: Note[];
  addNote: (note: Omit<Note, "id" | "createdAt">) => void;
  updateNote: (note: Note) => void;
  deleteNote: (noteId: string) => void;
  pinNote: (noteId: string, isPinned: boolean) => void;
  getPinnedNotes: () => Note[];
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const useNotesContext = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotesContext must be used within a NotesProvider");
  }
  return context;
};

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const { activeUser } = useAuth();

  // Load notes from localStorage
  useEffect(() => {
    const storedNotes = localStorage.getItem("2getherLoop_notes");
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    }
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem("2getherLoop_notes", JSON.stringify(notes));
  }, [notes]);

  const addNote = (noteData: Omit<Note, "id" | "createdAt">) => {
    if (!activeUser) return;

    const id = `note_${Date.now().toString(36)}`;
    const newNote: Note = {
      ...noteData,
      id,
      createdAt: new Date().toISOString(),
    };

    setNotes(prev => [newNote, ...prev]);
  };

  const updateNote = (updatedNote: Note) => {
    setNotes(prev => 
      prev.map(note => note.id === updatedNote.id ? updatedNote : note)
    );
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const pinNote = (noteId: string, isPinned: boolean) => {
    setNotes(prev => 
      prev.map(note => 
        note.id === noteId ? { ...note, isPinned } : note
      )
    );
  };

  const getPinnedNotes = () => {
    return notes.filter(note => note.isPinned);
  };

  return (
    <NotesContext.Provider value={{
      notes,
      addNote,
      updateNote,
      deleteNote,
      pinNote,
      getPinnedNotes
    }}>
      {children}
    </NotesContext.Provider>
  );
};
