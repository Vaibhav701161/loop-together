
import React, { useState, useRef } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { Note } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { Pin, PinOff, Pencil, Trash2, Plus, Sticker } from "lucide-react";
import { useNotesContext } from "@/context/NotesContext";
import { toast } from "@/hooks/use-toast";

const noteColors = [
  "bg-yellow-100 hover:bg-yellow-200 border-yellow-300",
  "bg-blue-100 hover:bg-blue-200 border-blue-300",
  "bg-green-100 hover:bg-green-200 border-green-300",
  "bg-purple-100 hover:bg-purple-200 border-purple-300",
  "bg-pink-100 hover:bg-pink-200 border-pink-300",
  "bg-orange-100 hover:bg-orange-200 border-orange-300",
];

const emojis = ["❤️", "🎉", "😊", "👍", "🙌", "💪", "🔥", "✨", "🌈", "🌟", "💯", "🏆"];

const Notes: React.FC = () => {
  const { activeUser, users } = useAuth();
  const { notes, addNote, updateNote, deleteNote, pinNote } = useNotesContext();
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(noteColors[0]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  const currentUser = activeUser!;
  const otherUser = users.find(user => user.id !== currentUser.id)!;

  // Separate notes by recipient
  const notesForMe = notes.filter(note => note.toUserId === currentUser.id);
  const notesForOther = notes.filter(note => note.toUserId === otherUser.id);
  const pinnedNotes = notes.filter(note => note.isPinned);

  const handleAddNote = () => {
    if (!newNoteContent.trim()) {
      toast({
        title: "Note is empty",
        description: "Please write something in your note.",
        variant: "destructive"
      });
      return;
    }

    const newNote: Omit<Note, "id" | "createdAt"> = {
      fromUserId: currentUser.id,
      toUserId: otherUser.id,
      content: newNoteContent,
      color: selectedColor,
      emoji: selectedEmoji || undefined,
      isPinned: false
    };

    addNote(newNote);
    setNewNoteContent("");
    setSelectedEmoji(null);
    setSelectedColor(noteColors[0]);
    setIsAddNoteOpen(false);

    toast({
      title: "Note added",
      description: "Your note has been added to the wall!"
    });
  };

  const handleEditNote = () => {
    if (!currentNote || !newNoteContent.trim()) return;

    updateNote({
      ...currentNote,
      content: newNoteContent,
      color: selectedColor,
      emoji: selectedEmoji || undefined
    });

    setIsEditNoteOpen(false);
    toast({
      title: "Note updated",
      description: "Your note has been updated."
    });
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
    toast({
      title: "Note deleted",
      description: "Your note has been removed."
    });
  };

  const handlePinNote = (noteId: string, isPinned: boolean) => {
    pinNote(noteId, isPinned);
    toast({
      title: isPinned ? "Note pinned" : "Note unpinned",
      description: isPinned ? "Note will appear on dashboard." : "Note removed from dashboard."
    });
  };

  const openEditNote = (note: Note) => {
    setCurrentNote(note);
    setNewNoteContent(note.content);
    setSelectedColor(note.color);
    setSelectedEmoji(note.emoji || null);
    setIsEditNoteOpen(true);
  };

  const NoteCard: React.FC<{ note: Note; canEdit: boolean }> = ({ note, canEdit }) => {
    return (
      <Card 
        className={`${note.color} border-2 shadow-sm transition-all relative ${
          note.isPinned ? "ring-2 ring-primary ring-opacity-50" : ""
        }`}
      >
        <CardContent className="p-4">
          {note.emoji && (
            <div className="absolute -top-3 -right-3 text-2xl transform rotate-12">
              {note.emoji}
            </div>
          )}
          <div className="flex flex-col h-full">
            <div className="mb-2 text-sm text-gray-600">
              From: {note.fromUserId === currentUser.id ? 'You' : otherUser.name}
            </div>
            <p className="flex-grow whitespace-pre-wrap text-gray-800">{note.content}</p>
            <div className="mt-3 pt-2 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {format(parseISO(note.createdAt), "MMM d, h:mm a")}
              </span>
              {canEdit && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => handlePinNote(note.id, !note.isPinned)}
                  >
                    {note.isPinned ? (
                      <PinOff className="h-4 w-4" />
                    ) : (
                      <Pin className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => openEditNote(note)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-500" 
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const NoteForm = () => (
    <div className="space-y-4">
      <Textarea
        placeholder="Write a note for your partner..."
        value={newNoteContent}
        onChange={(e) => setNewNoteContent(e.target.value)}
        className="min-h-[100px]"
      />
      <div>
        <div className="text-sm text-gray-500 mb-2">Select a color</div>
        <div className="grid grid-cols-6 gap-2">
          {noteColors.map((color, index) => (
            <div 
              key={index}
              className={`h-8 rounded cursor-pointer border-2 ${color} ${
                selectedColor === color ? "ring-2 ring-primary ring-offset-2" : ""
              }`}
              onClick={() => setSelectedColor(color)}
            />
          ))}
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-500 mb-2">Add an emoji (optional)</div>
        <div className="grid grid-cols-6 gap-2">
          {emojis.map((emoji, index) => (
            <div 
              key={index}
              className={`h-8 w-8 flex items-center justify-center text-xl rounded cursor-pointer border ${
                selectedEmoji === emoji ? "bg-primary/20 border-primary" : "border-gray-200"
              }`}
              onClick={() => setSelectedEmoji(emoji === selectedEmoji ? null : emoji)}
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto max-w-5xl px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold gradient-heading">Notes & Sticker Wall</h1>
          <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Leave a note for {otherUser.name}</DialogTitle>
                <DialogDescription>
                  Write a sweet message, reminder, or anything you want to share.
                </DialogDescription>
              </DialogHeader>
              <NoteForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddNoteOpen(false)}>Cancel</Button>
                <Button onClick={handleAddNote}>Add Note</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {pinnedNotes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Pin className="h-4 w-4 mr-2" /> Pinned Notes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pinnedNotes.map(note => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  canEdit={note.fromUserId === currentUser.id}
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Sticker className="h-4 w-4 mr-2" /> Notes for You
            </h2>
            {notesForMe.length === 0 ? (
              <Card className="bg-muted/30">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    No notes yet. Ask {otherUser.name} to leave you a note!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {notesForMe.map(note => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    canEdit={false}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Sticker className="h-4 w-4 mr-2" /> Your Notes for {otherUser.name}
            </h2>
            {notesForOther.length === 0 ? (
              <Card className="bg-muted/30">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    You haven't written any notes yet. Leave a nice message for {otherUser.name}!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {notesForOther.map(note => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    canEdit={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <Dialog open={isEditNoteOpen} onOpenChange={setIsEditNoteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
              <DialogDescription>
                Update your note for {otherUser.name}.
              </DialogDescription>
            </DialogHeader>
            <NoteForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditNoteOpen(false)}>Cancel</Button>
              <Button onClick={handleEditNote}>Update Note</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Notes;
