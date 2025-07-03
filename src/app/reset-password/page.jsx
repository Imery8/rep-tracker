"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../utils/supabaseClient";

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Supabase handles the authentication automatically when users click the reset link
    // No need to validate parameters here as the auth state is already set
  }, [searchParams]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 border border-gray-200 rounded-lg shadow-lg bg-white w-11/12 sm:w-auto">
        <div className="text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Password Reset Successful</h1>
          <p className="text-gray-600 mb-6">
            Your password has been updated successfully. You will be redirected to the login page in a few seconds.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold transition-colors"
          >
            Go to Login Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border border-gray-200 rounded-lg shadow-lg bg-white w-11/12 sm:w-auto">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Reset Your Password</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handlePasswordReset}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <input
            type="password"
            placeholder="Enter your new password"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            placeholder="Confirm your new password"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold transition-colors"
          disabled={loading}
        >
          {loading ? "Updating Password..." : "Update Password"}
        </button>

        <button
          type="button"
          onClick={() => router.push('/login')}
          className="bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 font-semibold transition-colors"
        >
          Back to Login
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto mt-20 p-6 border border-gray-200 rounded-lg shadow-lg bg-white w-11/12 sm:w-auto">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>}>
      <ResetPasswordContent />
    </Suspense>
  );
} 