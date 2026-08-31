"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("Logging in...");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/local`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            identifier,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data?.error?.message ||
            "Login failed."
        );

        setLoading(false);
        return;
      }

      if (!data?.jwt) {
        setMessage(
          "Login token was not received."
        );

        setLoading(false);
        return;
      }

      // ==========================================
      // SAVE JWT
      // ==========================================

      localStorage.setItem(
        "lms_token",
        data.jwt
      );

      localStorage.removeItem(
        "lms_role"
      );

      let role = "";

      try {
        const userResponse =
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/me?populate=role`,
            {
              headers: {
                Authorization:
                  `Bearer ${data.jwt}`,
              },
              cache: "no-store",
            }
          );

        if (userResponse.ok) {
          const user =
            await userResponse.json();

          const roleName =
            user?.role?.name
              ?.trim()
              .toLowerCase();

          if (
            roleName === "student" ||
            roleName === "instructor" ||
            roleName === "admin"
          ) {
            role = roleName;

            localStorage.setItem(
              "lms_role",
              role
            );

            localStorage.setItem(
              "lms_user",
              JSON.stringify(user)
            );
          }
        }
      } catch (error) {
        console.error(
          "User role lookup error:",
          error
        );
      }

      if (!role) {
        localStorage.setItem(
          "lms_user",
          JSON.stringify(data.user)
        );
      }

      window.dispatchEvent(
        new Event("lms-auth-changed")
      );

      setMessage(
        `Welcome, ${data.user.username}!`
      );

      if (role === "admin") {
        router.replace(
          "/admin/dashboard"
        );
      } else if (
        role === "instructor"
      ) {
        router.replace(
          "/instructor/dashboard"
        );
      } else {
        router.replace("/");
      }
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setMessage(
        "Something went wrong. Please try again."
      );

      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-10 text-white sm:px-6 sm:py-16">

      <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-md items-center">

        <div className="w-full">

          {/* =====================================
              BRAND / HEADER
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
                Welcome back
              </h1>

              <p className="mt-3 text-sm leading-6 text-[#777]">
                Sign in to continue your
                learning journey.
              </p>

            </div>

          </div>

          {/* =====================================
              LOGIN CARD
          ===================================== */}

          <div className="rounded-2xl border border-[#292929] bg-[#0b0b0b] p-5 shadow-2xl shadow-black/20 sm:p-7">

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              {/* Identifier */}

              <div>

                <label
                  htmlFor="identifier"
                  className="mb-2 block text-sm font-medium text-[#ddd]"
                >
                  Email or Username
                </label>

                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(event) =>
                    setIdentifier(
                      event.target.value
                    )
                  }
                  placeholder="Enter email or username"
                  required
                  disabled={loading}
                  autoComplete="username"
                  className="w-full rounded-xl border border-[#303030] bg-[#070707] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[#555] focus:border-[#f15a24]/50 focus:ring-1 focus:ring-[#f15a24]/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

              </div>

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
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[#303030] bg-[#070707] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[#555] focus:border-[#f15a24]/50 focus:ring-1 focus:ring-[#f15a24]/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

              </div>

              {/* Message */}

              {message && (
                <div className="rounded-xl border border-[#292929] bg-[#070707] px-4 py-3 text-sm leading-5 text-[#aaa]">
                  {message}
                </div>
              )}

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#f15a24] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#d94b1f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Logging in..."
                  : "Login"}
              </button>

            </form>

            {/* Register */}

            <div className="mt-6 border-t border-[#202020] pt-6 text-center">

              <p className="text-sm text-[#666]">
                Don't have an account?
              </p>

              <Link
                href="/register"
                className="mt-2 inline-block text-sm font-medium text-[#f15a24] transition hover:text-[#ff7040]"
              >
                Create an account →
              </Link>

            </div>

          </div>

          {/* Back home */}

          <div className="mt-6 text-center">

            <Link
              href="/"
              className="text-xs text-[#555] transition hover:text-[#aaa]"
            >
              ← Back to Home
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}