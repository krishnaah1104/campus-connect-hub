import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import campusAsset from "@/assets/campus-aerial.jpeg.asset.json";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScaleX — One Campus. Infinite Connections." },
      {
        name: "description",
        content:
          "The verified student directory for SST. Find batchmates, project peers, clubs and campus life — all in one place.",
      },
      { property: "og:title", content: "ScaleX — One Campus. Infinite Connections." },
      {
        property: "og:description",
        content:
          "The verified student directory for SST. Find batchmates, project peers, clubs and campus life — all in one place.",
      },
    ],
  }),
  component: Welcome,
});

const HIGHLIGHTS = [
  "Travel Together",
  "Learn Together",
  "Find Your People",
  "Build Together",
  "Stay Connected",
  "Explore More",
];

function Welcome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/explore" });
    });
  }, [navigate]);

  const signIn = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
      extraParams: { prompt: "select_account" },
    });
    if (result.error) {
      setLoading(false);
      toast.error("Sign in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/explore" });
  };

  return (
    <main className="relative flex min-h-screen flex-col bg-surface-deep">
      <div className="absolute inset-x-0 top-0 h-[58vh] min-h-[320px] overflow-hidden">
        <img
          src={campusAsset.url}
          alt="Aerial view of the SST campus building and sports ground"
          className="h-full w-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-veil)" }}
          aria-hidden
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-end px-6 pb-10 pt-[46vh] sm:max-w-lg">
        <div className="flex items-center gap-3">
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-lg font-black text-primary-foreground"
            style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
          >
            S
          </div>
          <div className="min-w-0">
            <p className="truncate text-2xl font-extrabold tracking-[0.18em] text-foreground">
              SCALER
            </p>
            <p className="truncate text-sm font-semibold tracking-[0.42em] text-primary">
              CONNECT
            </p>
          </div>
        </div>

        <h1 className="mt-8 text-4xl font-bold leading-tight tracking-tight text-foreground">
          One Campus.
          <br />
          <span className="text-gradient-brand">Infinite Connections.</span>
        </h1>

        <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-border/60">
          {HIGHLIGHTS.map((item) => (
            <div
              key={item}
              className="bg-surface-deep px-2 py-4 text-center text-xs font-medium text-foreground/90 sm:text-sm"
            >
              {item}
            </div>
          ))}
        </div>

        <button
          onClick={signIn}
          disabled={loading}
          className="mt-9 flex h-14 w-full items-center gap-3 rounded-full px-5 text-base font-semibold text-primary-foreground transition-transform duration-200 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-foreground">
            <GoogleMark />
          </span>
          <span className="flex-1 text-center">
            {loading ? "Connecting…" : "Continue with Google"}
          </span>
          <ArrowRight className="h-5 w-5 shrink-0" />
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          OR
          <span className="h-px flex-1 bg-border" />
        </div>

        <button
          onClick={() => toast("Email sign-in is coming soon — use Google for now.")}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-full border border-primary/40 text-base font-semibold text-foreground transition-colors duration-200 hover:bg-primary/10"
        >
          <Mail className="h-5 w-5" />
          Continue with Email
        </button>

        <div className="mt-7 flex flex-col items-center gap-2 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified SST Students • College-Only Access
          </span>
          <p className="text-xs text-muted-foreground">
            Only @sst.scaler.com accounts are allowed.
          </p>
        </div>
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2.5 24 .5 14.6.5 6.5 5.9 2.6 13.7l7.8 6.1C12.3 13.9 17.6 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-2.8-.4-4.1H24v7.8h12.7c-.3 2.1-1.6 5.3-4.7 7.4l7.6 5.9c4.5-4.2 6.9-10.3 6.9-17z"
      />
      <path
        fill="#FBBC05"
        d="M10.4 28.2c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C1 16.1 0 19.9 0 23.5s1 7.4 2.6 10.8l7.8-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 47.5c6.2 0 11.5-2 15.3-5.6l-7.6-5.9c-2 1.4-4.7 2.4-7.7 2.4-6.4 0-11.7-4.4-13.6-10.2l-7.8 6.1C6.5 42.1 14.6 47.5 24 47.5z"
      />
    </svg>
  );
}
