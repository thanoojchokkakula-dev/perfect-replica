import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or create an account | MobileTracker" },
      {
        name: "description",
        content:
          "Sign in to your MobileTracker account or create a new one to add a phone and follow its messages, calls and locations.",
      },
      { property: "og:title", content: "Sign in or create an account | MobileTracker" },
      {
        property: "og:description",
        content: "Access your MobileTracker dashboard to follow messages, calls and locations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setNotice("Almost there — check your inbox and click the confirmation link, then sign in.");
          setMode("signin");
          return;
        }
        navigate({ to: "/dashboard", replace: true });
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in did not complete. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 font-sans">
      <div className="w-full max-w-md rounded-sm border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3 bg-[var(--topbar)] px-6 py-5">
          <span className="flex size-7 items-center justify-center rounded-full bg-brand text-[15px] font-bold text-[var(--topbar)]">
            M
          </span>
          <div className="leading-none">
            <span className="text-[22px] font-semibold text-[var(--topbar-foreground)]">Mobile</span>
            <span className="text-[22px] font-light text-[var(--topbar-foreground)]">Tracker</span>
          </div>
        </div>

        <div className="px-6 py-7">
          <h1 className="text-xl font-semibold text-brand">
            {mode === "signin" ? "Sign in to your account" : "Create your account"}
          </h1>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="mb-1 block text-sm text-muted-foreground" htmlFor="fullName">
                  Full name
                </label>
                <input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Jane Doe"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm text-muted-foreground" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {notice && <p className="text-sm text-brand">{notice}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-sm bg-info px-5 py-3 text-sm font-semibold uppercase tracking-wide text-info-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs uppercase text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <button
            onClick={handleGoogle}
            className="w-full rounded-sm border border-border px-5 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
              }}
              className="font-semibold text-brand"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
          <p className="mt-4 text-center text-sm">
            <Link to="/" className="text-muted-foreground underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
