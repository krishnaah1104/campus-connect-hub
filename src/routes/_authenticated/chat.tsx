import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StagedPanel } from "@/components/StagedPanel";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({
    meta: [
      { title: "Direct Messages — ScaleX Connect" },
      { name: "description", content: "One-on-one conversations with verified campus students." },
      { property: "og:title", content: "Direct Messages — ScaleX Connect" },
      {
        property: "og:description",
        content: "One-on-one conversations with verified campus students.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <StagedPanel
        icon={MessageCircle}
        title="Direct Messages"
        subtitle="Private one-on-one conversations with anyone in the directory."
        note="Realtime messaging lands next — start by finding people in Explore."
      />
    </AppShell>
  ),
});
