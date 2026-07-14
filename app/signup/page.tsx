// app/signup/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup, login, getToken, getEmail } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { friendlyError } from "@/lib/errors";

const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 72,
  hasUpper: /[A-Z]/,
  hasLower: /[a-z]/,
  hasDigit: /\d/,
};

function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_RULES.minLength)
    return `At least ${PASSWORD_RULES.minLength} characters`;
  if (password.length > PASSWORD_RULES.maxLength)
    return `At most ${PASSWORD_RULES.maxLength} characters`;
  if (!PASSWORD_RULES.hasUpper.test(password)) return "At least one uppercase letter";
  if (!PASSWORD_RULES.hasLower.test(password)) return "At least one lowercase letter";
  if (!PASSWORD_RULES.hasDigit.test(password)) return "At least one digit";
  return null;
}

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setAuth: syncAuthState } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(`Password must contain: ${passwordError}`);
      return;
    }

    setLoading(true);

    const signupResult = await signup(email, password);
    if (!signupResult.success) {
      setError(friendlyError(signupResult.error || "Signup failed"));
      setLoading(false);
      return;
    }

    // Auto-login after successful signup
    const loginResult = await login(email, password);
    setLoading(false);

    if (loginResult.success) {
      // Guard against storage failures (private browsing, sandboxed iframes)
      const token = getToken();
      const emailFromStorage = getEmail();
      if (!token || !emailFromStorage) {
        setError("Account created, but the session couldn't be saved. Please log in.");
        router.push("/login");
        return;
      }
      syncAuthState(token, emailFromStorage);
      router.push("/");
    } else {
      router.push("/login?error=account-created-login-failed");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">Create account</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Sign up to bookmark contests.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-500 dark:focus:border-slate-500 focus:outline-none"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-500 dark:focus:border-slate-500 focus:outline-none"
                placeholder="••••••••"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Min 8 chars, with uppercase, lowercase, and digit
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-500 dark:focus:border-slate-500 focus:outline-none"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-slate-900 dark:text-slate-100 underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}