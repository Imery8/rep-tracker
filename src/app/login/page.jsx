"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoginLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({ email, password });
    setSignupLoading(false);
    if (error) {
      setError(error.message);
    } else {
      // Show email confirmation message instead of redirecting
      setSignupEmail(email);
      setShowEmailConfirmation(true);
      setEmail("");
      setPassword("");
    }
  };

  const handleBackToLogin = () => {
    setShowEmailConfirmation(false);
    setSignupEmail("");
    setError("");
  };

  if (showEmailConfirmation) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 border border-gray-200 rounded-lg shadow-lg bg-white w-11/12 sm:w-auto">
        <div className="text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Check Your Email</h1>
          <p className="text-gray-600 mb-6">
            We've sent a confirmation link to <strong>{signupEmail}</strong>
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>Next steps:</strong>
            </p>
            <ol className="text-blue-700 text-sm mt-2 space-y-1">
              <li>1. Check your email inbox (and spam folder)</li>
              <li>2. Click the confirmation link in the email</li>
              <li>3. Come back here and log in</li>
            </ol>
          </div>
          <button
            onClick={handleBackToLogin}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border border-gray-200 rounded-lg shadow-lg bg-white w-11/12 sm:w-auto">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Login / Signup</h1>
      <form className="flex flex-col gap-4" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold transition-colors"
          disabled={loginLoading || signupLoading}
        >
          {loginLoading ? "Logging in..." : "Login"}
        </button>
        <button
          type="button"
          className="bg-gray-600 text-white py-2 rounded hover:bg-gray-700 font-semibold transition-colors"
          onClick={handleSignup}
          disabled={loginLoading || signupLoading}
        >
          {signupLoading ? "Signing up..." : "Sign up"}
        </button>
      </form>
    </div>
  );
} 