"use client";

import { API_URL } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");

    // Password validation
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setMessage(
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);
      setMessage(
        "Creating your account..."
      );

      const response = await fetch(
        `${API_URL}/api/auth/local/register`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Register API:",
        data
      );

      if (!response.ok) {
        setMessage(
          data?.error?.message ||
            "Registration failed. Please try again."
        );
        return;
      }

      setMessage(
        "Registration successful! Redirecting to login..."
      );

      // Go to login page after successful registration
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-10 text-white sm:px-6 sm:py-14">

      <div className="mx-auto w-full max-w-lg">

        {/* =====================================
            BRAND
        ===================================== */}

        <div className="mb-7 text-center">

          <Link
            href="/"
            className="inline-flex items-center gap-2"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f15a24] text-sm font-black text-white">
              L
            </span>

            <span className="text-lg font-bold tracking-tight">
              LMS
            </span>
          </Link>

          <div className="mt-8">

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f15a24]">
              LMS Account
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Create your account
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#777]">
              Join the LMS and start your
              learning journey.
            </p>

          </div>

        </div>

        {/* =====================================
            REGISTER CARD
        ===================================== */}

        <div className="rounded-2xl border border-[#292929] bg-[#0b0b0b] p-5 shadow-2xl shadow-black/20 sm:p-7">

          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >

            {/* =================================
                PERSONAL INFORMATION
            ================================= */}

            <div className="border-b border-[#202020] pb-4">

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f15a24]">
                Account Setup
              </p>

              <p className="mt-1 text-sm text-[#666]">
                Enter your information below.
              </p>

            </div>

            {/* Full Name */}

            <div>

              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-[#ddd]"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                required
                disabled={loading}
                placeholder="Enter your full name"
                autoComplete="name"
                className="w-full rounded-xl border border-[#303030] bg-[#070707] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[#555] focus:border-[#f15a24]/50 focus:ring-1 focus:ring-[#f15a24]/20 disabled:cursor-not-allowed disabled:opacity-60"
              />

            </div>

            {/* Phone */}

            <div>

              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-[#ddd]"
              >
                Phone Number
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value
                  )
                }
                required
                disabled={loading}
                placeholder="Enter your phone number"
                autoComplete="tel"
                className="w-full rounded-xl border border-[#303030] bg-[#070707] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[#555] focus:border-[#f15a24]/50 focus:ring-1 focus:ring-[#f15a24]/20 disabled:cursor-not-allowed disabled:opacity-60"
              />

            </div>

            {/* Username */}

            <div>

              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-[#ddd]"
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value
                  )
                }
                required
                disabled={loading}
                placeholder="Choose a username"
                autoComplete="username"
                className="w-full rounded-xl border border-[#303030] bg-[#070707] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[#555] focus:border-[#f15a24]/50 focus:ring-1 focus:ring-[#f15a24]/20 disabled:cursor-not-allowed disabled:opacity-60"
              />

            </div>

            {/* Email */}

            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#ddd]"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                required
                disabled={loading}
                placeholder="Enter your email"
                autoComplete="email"
                className="w-full rounded-xl border border-[#303030] bg-[#070707] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[#555] focus:border-[#f15a24]/50 focus:ring-1 focus:ring-[#f15a24]/20 disabled:cursor-not-allowed disabled:opacity-60"
              />

            </div>

            {/* =================================
                PASSWORD
            ================================= */}

            <div className="border-t border-[#202020] pt-5">

              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f15a24]">
                Security
              </p>

              <div className="space-y-5">

                {/* Password */}

                <div>

                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-[#ddd]"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    required
                    disabled={loading}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-[#303030] bg-[#070707] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[#555] focus:border-[#f15a24]/50 focus:ring-1 focus:ring-[#f15a24]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <p className="mt-2 text-xs text-[#555]">
                    Minimum 6 characters.
                  </p>

                </div>

                {/* Confirm Password */}

                <div>

                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-[#ddd]"
                  >
                    Confirm Password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    required
                    disabled={loading}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-[#303030] bg-[#070707] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[#555] focus:border-[#f15a24]/50 focus:ring-1 focus:ring-[#f15a24]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                </div>

              </div>

            </div>

            {/* =================================
                MESSAGE
            ================================= */}

            {message && (
              <div className="rounded-xl border border-[#292929] bg-[#070707] px-4 py-3 text-sm leading-5 text-[#aaa]">
                {message}
              </div>
            )}

            {/* =================================
                SUBMIT
            ================================= */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#f15a24] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#d94b1f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>

          </form>

          {/* ===================================
              LOGIN
          =================================== */}

          <div className="mt-6 border-t border-[#202020] pt-6 text-center">

            <p className="text-sm text-[#666]">
              Already have an account?
            </p>

            <Link
              href="/login"
              className="mt-2 inline-block text-sm font-medium text-[#f15a24] transition hover:text-[#ff7040]"
            >
              Login to your account →
            </Link>

          </div>

        </div>

        {/* =====================================
            BACK HOME
        ===================================== */}

        <div className="mt-6 text-center">

          <Link
            href="/"
            className="text-xs text-[#555] transition hover:text-[#aaa]"
          >
            ← Back to Home
          </Link>

        </div>

      </div>

    </main>
  );
}