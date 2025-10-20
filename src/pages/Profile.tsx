import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { books as localBooks } from "@/data/books";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type Status = 'plan' | 'reading' | 'on_hold' | 'completed';

export default function Profile() {
  const [sessionId] = useState(() => {
    let id = localStorage.getItem("sessionId");
    if (!id) { id = Math.random().toString(36).substring(7); localStorage.setItem("sessionId", id); }
    return id;
  });
  const [name, setName] = useState<string>("");
  const [bookmarks, setBookmarks] = useState<Record<Status, string[]>>({ plan: [], reading: [], on_hold: [], completed: [] });

  useEffect(() => {
    const load = async () => {
      await supabase.from('profiles').upsert({ user_session_id: sessionId }, { onConflict: 'user_session_id' });
      const { data: prof } = await supabase.from('profiles').select('display_name').eq('user_session_id', sessionId).maybeSingle();
      setName(prof?.display_name || "Reader");
      const { data: bms } = await supabase.from('bookmarks').select('book_id,status').eq('user_session_id', sessionId);
      const init: Record<Status, string[]> = { plan: [], reading: [], on_hold: [], completed: [] };
      (bms || []).forEach((b: { book_id: string; status: Status }) => { init[b.status as Status].push(b.book_id); });
      setBookmarks(init);
    };
    load();
  }, [sessionId]);

  const setStatus = async (bookId: string, status: Status) => {
    await supabase.from('bookmarks').upsert({ user_session_id: sessionId, book_id: bookId, status }, { onConflict: 'user_session_id,book_id' });
    setBookmarks((prev) => {
      const next: Record<Status, string[]> = { plan: [], reading: [], on_hold: [], completed: [] };
      (Object.keys(prev) as Status[]).forEach(s => { next[s] = prev[s].filter(id => id !== bookId); });
      next[status] = [...next[status], bookId];
      return next;
    });
  };

  const sections: { key: Status; title: string }[] = [
    { key: 'plan', title: 'Plan to Read' },
    { key: 'reading', title: 'Reading' },
    { key: 'on_hold', title: 'On Hold' },
    { key: 'completed', title: 'Completed' },
  ];

  const bookMeta = (id: string) => localBooks.find(b => b.id === id);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold mb-6">Hello, {name}</h1>
        <p className="text-muted-foreground mb-10">Manage your bookmarks and continue reading.</p>

        {sections.map((sec) => (
          <div key={sec.key} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-semibold">{sec.title}</h2>
              <Badge>{bookmarks[sec.key].length}</Badge>
            </div>
            {bookmarks[sec.key].length === 0 ? (
              <p className="text-sm text-muted-foreground">No books here yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarks[sec.key].map((id) => {
                  const meta = bookMeta(id);
                  if (!meta) return null;
                  return (
                    <div key={id} className="p-4 rounded-xl bg-card shadow-md">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold">{meta.title}</p>
                          <p className="text-xs text-muted-foreground">{meta.author}</p>
                        </div>
                        <Link to={`/book/${meta.id}`}><Button size="sm" variant="outline">Open</Button></Link>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {sections.map(s => (
                          <Button key={s.key} size="xs" variant={sec.key === s.key ? 'default' : 'outline'} onClick={() => setStatus(id, s.key)}>
                            {s.title}
                          </Button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


