import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BookForm { id: string; title: string; author: string; pdf_url: string; cover_url: string; genre: string; }

export default function Admin() {
  const [books, setBooks] = useState<BookForm[]>([]);
  const [form, setForm] = useState<BookForm>({ id: "", title: "", author: "", pdf_url: "", cover_url: "", genre: "" });

  const load = async () => {
    const { data } = await supabase.from('books').select('*').order('created_at', { ascending: false });
    setBooks(data || []);
  };

  useEffect(() => { load(); }, []);

  const upsert = async () => {
    if (!form.id || !form.title || !form.pdf_url) return;
    await supabase.from('books').upsert(form);
    setForm({ id: "", title: "", author: "", pdf_url: "", cover_url: "", genre: "" });
    await load();
  };

  const remove = async (id: string) => {
    await supabase.from('books').delete().eq('id', id);
    await load();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Admin - Manage Books</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-4 rounded-xl bg-card shadow-md">
            <h2 className="font-semibold mb-4">Add / Update Book</h2>
            <div className="space-y-3">
              <Input placeholder="ID (unique)" value={form.id} onChange={e=>setForm({...form,id:e.target.value})} />
              <Input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
              <Input placeholder="Author" value={form.author} onChange={e=>setForm({...form,author:e.target.value})} />
              <Input placeholder="Genre" value={form.genre} onChange={e=>setForm({...form,genre:e.target.value})} />
              <Input placeholder="PDF URL" value={form.pdf_url} onChange={e=>setForm({...form,pdf_url:e.target.value})} />
              <Input placeholder="Cover URL" value={form.cover_url} onChange={e=>setForm({...form,cover_url:e.target.value})} />
              <Button onClick={upsert}>Save</Button>
            </div>
          </div>
          <div>
            <h2 className="font-semibold mb-4">Catalog</h2>
            <div className="space-y-3">
              {books.map((b) => (
                <div key={b.id} className="p-3 rounded-lg bg-card shadow flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{b.title}</p>
                    <p className="text-xs text-muted-foreground">{b.author} • {b.genre}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setForm(b)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(b.id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


