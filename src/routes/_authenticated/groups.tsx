import { createFileRoute } from "@tanstack/react-router";
import { UsersRound } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StagedPanel } from "@/components/StagedPanel";

export const Route = createFileRoute("/_authenticated/groups")({
  head: () => ({
    meta: [
      { title: "Group Channels — ScaleX Connect" },
      {
        name: "description",
        content: "Auto-enrolled hostel, batch and club channels for your campus.",
      },
      { property: "og:title", content: "Group Channels — ScaleX Connect" },
      {
        property: "og:description",
        content: "Auto-enrolled hostel, batch and club channels for your campus.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <StagedPanel
        icon={UsersRound}
        title="Group Channels"
        subtitle="Auto-enrolled hostel, batch and club channels."
        note="Channels are generated from your verified profile attributes."
      />
    </AppShell>
  ),
});
