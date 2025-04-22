
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotes } from "@/context/NotesContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";

const noteColors = [
  "bg-pink-100 border-pink-400",
  "bg-blue-100 border-blue-400",
  "bg-purple-100 border-purple-400",
  "bg-yellow-100 border-yellow-400",
  "bg-green-100 border-green-400",
  "bg-orange-100 border-orange-400",
];

const Notes: React.FC = () => {
  const { activeUser, users } = useAuth();
  const { notes, addNote, deleteNote, getUserNotes } = useNotes();
  
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [selectedColor, setSelectedColor] = useState(noteColors[0]);
  
  const otherUser = users.find(u => u.id !== activeUser?.id);
  const userNotes = activeUser ? getUserNotes(activeUser.id) : [];
  
  const handleAddNote = () => {
    if (!activeUser || !otherUser || !noteContent.trim()) return;
    
    addNote({
      fromUserId: otherUser.id,
      toUserId: activeUser.id,
      content: noteContent,
      color: selectedColor,
    });
    
    setNoteContent("");
    setIsAddingNote(false);
  };
  
  return (
    <Layout>
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold gradient-heading">Sticky Notes Wall</h1>
          <Button onClick={() => setIsAddingNote(true)}>
            Add Note
          </Button>
        </div>
        
        {userNotes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">
                No notes on your wall yet. Add your first note!
              </p>
              <Button onClick={() => setIsAddingNote(true)}>
                Add Your First Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {userNotes.map(note => (
              <div
                key={note.id}
                className={`${note.color} border-2 rounded-md p-4 relative transform rotate-[-1deg] hover:rotate-0 transition-transform shadow-md`}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full opacity-40 hover:opacity-100"
                  onClick={() => deleteNote(note.id)}
                >
                  ✕
                </Button>
                <p className="whitespace-pre-wrap break-words mb-3">{note.content}</p>
                <p className="text-xs text-right text-muted-foreground">
                  From {users.find(u => u.id === note.fromUserId)?.name} •{" "}
                  {format(parseISO(note.createdAt), "MMM d")}
                </p>
              </div>
            ))}
          </div>
        )}
        
        <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Add a Note to {activeUser?.name}'s Wall
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your note here..."
                className="min-h-[150px]"
              />
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Choose a color:</p>
                <div className="flex flex-wrap gap-2">
                  {noteColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded ${color} border ${
                        selectedColor === color ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Select ${color} color`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingNote(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote} disabled={!noteContent.trim()}>
                Add Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Notes;
