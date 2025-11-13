import { useEffect, useState } from 'react';
import EnhancedImage from '@/components/EnhancedImage';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { getBookCover } from '@/utils/bookCoverMapping';

type ProbeResult = {
  title: string;
  mappedSrc: string;
  exists: boolean | null;
  status: number | null;
};

const sampleTitles = [
  "Harry Potter and the Philosopher's Stone",
  "Ikigai",
  "The Godfather",
  "The Girl in Room 105",
  "Wings of Fire",
  "Unknown Book Title"
];

export default function CoverTest() {
  const [results, setResults] = useState<ProbeResult[]>([]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const checks: ProbeResult[] = [];
      for (const title of sampleTitles) {
        const src = getBookCover(title);
        try {
          const res = await fetch(src, { method: 'HEAD' });
          checks.push({ title, mappedSrc: src, exists: res.ok, status: res.status });
        } catch (e) {
          checks.push({ title, mappedSrc: src, exists: null, status: null });
        }
      }
      if (!cancelled) setResults(checks);
    };
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Cover Mapping & Component Test</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sampleTitles.map((title, idx) => {
          const mapped = results.find(r => r.title === title);
          return (
            <div key={idx} className="border rounded-lg p-4">
              <div className="mb-2 font-semibold">{title}</div>
              <div className="text-xs text-muted-foreground mb-3 break-all">{mapped?.mappedSrc || '(mapping pending...)'}</div>
              <div className="text-xs mb-4">
                File check: {mapped?.exists === true ? 'Exists ✅' : mapped?.exists === false ? `Missing ❌ (status ${mapped?.status})` : 'Unknown'}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm mb-2">EnhancedImage</div>
                  <div className="aspect-[2/3] overflow-hidden rounded bg-muted">
                    <EnhancedImage bookTitle={title} alt={title} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div>
                  <div className="text-sm mb-2">ImageWithFallback</div>
                  <div className="aspect-[2/3] overflow-hidden rounded bg-muted">
                    <ImageWithFallback src={getBookCover(title)} alt={title} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

