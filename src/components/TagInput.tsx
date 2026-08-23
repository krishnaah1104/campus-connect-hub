import { useState, type KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";
import { normalizeTag } from "@/lib/campus";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: readonly string[];
  tone?: "primary" | "warning" | "accent" | "muted";
  maxTags?: number;
}

export function TagInput({
  tags,
  onChange,
  placeholder = "Type and press comma or Enter...",
  suggestions = [],
  tone = "primary",
  maxTags = 20,
}: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = (raw: string) => {
    const normalized = normalizeTag(raw);
    if (!normalized) return;

    // Check if tag already exists (case-insensitive)
    const exists = tags.some((t) => t.toLowerCase() === normalized.toLowerCase());
    if (exists || tags.length >= maxTags) {
      setInput("");
      return;
    }

    onChange([...tags, normalized]);
    setInput("");
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, i) => i !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      e.preventDefault();
      removeTag(tags.length - 1);
    }
  };

  const handleBlur = () => {
    if (input.trim()) {
      addTag(input);
    }
  };

  const badgeStyles =
    tone === "primary"
      ? "border-primary/30 bg-primary/12 text-primary"
      : tone === "warning"
        ? "border-amber-500/30 bg-amber-500/12 text-amber-300"
        : tone === "accent"
          ? "border-accent/30 bg-accent/15 text-accent-foreground"
          : "border-border bg-secondary text-foreground/90";

  // Filter suggestions to show only unselected ones
  const availableSuggestions = suggestions.filter(
    (s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="space-y-2.5">
      {/* Input container */}
      <div className="flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-2xl border border-input bg-card/80 p-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
        {tags.map((tag, idx) => (
          <span
            key={`${tag}-${idx}`}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeStyles}`}
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="grid h-3.5 w-3.5 place-items-center rounded-full opacity-70 transition-opacity hover:opacity-100"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {tags.length < maxTags && (
          <input
            type="text"
            value={input}
            onChange={(e) => {
              const val = e.target.value;
              if (val.includes(",")) {
                const parts = val.split(",");
                parts.forEach((p) => p.trim() && addTag(p));
              } else {
                setInput(val);
              }
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={tags.length === 0 ? placeholder : "Add more…"}
            className="h-8 min-w-[130px] flex-1 bg-transparent px-2 text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
        )}
      </div>

      {/* Suggested chips if any */}
      {availableSuggestions.length > 0 && tags.length < maxTags && (
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <span className="text-[11px] text-muted-foreground mr-1">Suggestions:</span>
          {availableSuggestions.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="inline-flex items-center gap-0.5 rounded-full border border-border/70 bg-card/40 px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
            >
              <Plus className="h-2.5 w-2.5" />
              <span>{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
