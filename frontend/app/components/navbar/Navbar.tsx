"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Role =
  | "student"
  | "instructor"
  | "admin"
  | "content-manager"
  | "";

type User = {
  id: number;
  username: string;
  email: string;
  role?: {
    id: number;
    name: string;
    type?: string;
  } | null;
};

export default function Navbar() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    function normalizeRole(value: string | null): Role {
      const roleName = value?.trim().toLowerCase();

      if (roleName === "student") return "student";
      if (roleName === "instructor") return "instructor";
      if (roleName === "admin") return "admin";

      if (
        roleName === "content manager" ||
        roleName === "content-manager" ||
        roleName === "content_manager"
      ) {
        return "content-manager";
      }

      return "";
    }

    function readSavedRole(): Role {
      return normalizeRole(
        localStorage.getItem("lms_role")
      );
    }

    async function loadUser() {
      const token =
        localStorage.getItem("lms_token");

      if (!token) {
        setRole("");
        setChecking(false);
        return;
      }

      const savedRole = readSavedRole();

      if (savedRole) {
        setRole(savedRole);
        setChecking(false);
      }

      try {
        const response = await fetch(
          "https://lms-learning-management-system-syom.onrender.com/api/users/me?populate=role",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          if (!savedRole) {
            setRole("");
          }

          setChecking(false);
          return;
        }

        const user: User =
          await response.json();

        console.log(
          "NAVBAR USER:",
          user
        );

        console.log(
          "NAVBAR ROLE:",
          user?.role?.name
        );

        const actualRole =
          normalizeRole(
            user?.role?.name || ""
          );

        if (actualRole) {
          localStorage.setItem(
            "lms_role",
            actualRole
          );

          localStorage.setItem(
            "lms_user",
            JSON.stringify(user)
          );

          setRole(actualRole);
        } else if (savedRole) {
          setRole(savedRole);
        }
      } catch (error) {
        console.error(
          "Navbar user error:",
          error
        );

        if (savedRole) {
          setRole(savedRole);
        }
      } finally {
        setChecking(false);
      }
    }

    window.addEventListener(
      "lms-auth-changed",
      loadUser
    );

    loadUser();

    return () => {
      window.removeEventListener(
        "lms-auth-changed",
        loadUser
      );
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem(
      "lms_token"
    );

    localStorage.removeItem(
      "lms_role"
    );

    localStorage.removeItem(
      "lms_user"
    );

    setRole("");

    router.replace("/");
  }

  // ==========================================
  // LOGGED OUT
  // ==========================================

  if (!checking && !role) {
    return (
      <NavbarShell>
        <NavbarLogo href="/" />

        <NavbarLinks>
          <NavLink
            href="/"
            label="Home"
          />

          <NavLink
            href="/courses"
            label="Courses"
          />
        </NavbarLinks>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-xs font-medium text-gray-400 transition hover:text-white sm:px-4 sm:text-sm"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-[#f15a24] px-3.5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#f15a24]/10 transition hover:bg-[#d94b1f] sm:px-4 sm:text-sm"
          >
            Register
          </Link>
        </div>
      </NavbarShell>
    );
  }

  // ==========================================
  // CHECKING
  // ==========================================

  if (checking && !role) {
    return (
      <NavbarShell>
        <NavbarLogo href="/" />

        <NavbarLinks>
          <NavLink
            href="/"
            label="Home"
          />

          <NavLink
            href="/courses"
            label="Courses"
          />
        </NavbarLinks>

        <div className="h-9 w-16 shrink-0 animate-pulse rounded-lg bg-white/[0.05]" />
      </NavbarShell>
    );
  }

  // ==========================================
  // ADMIN
  // ==========================================

  if (role === "admin") {
    return (
      <NavbarShell>
        <NavbarLogo href="/admin/dashboard" />

        <NavbarLinks>
          <NavLink
            href="/admin/dashboard"
            label="Dashboard"
          />

          <NavLink
            href="/courses"
            label="Courses"
          />
        </NavbarLinks>

        <LogoutButton
          onClick={handleLogout}
        />
      </NavbarShell>
    );
  }

  // ==========================================
  // CONTENT MANAGER
  // ==========================================

  if (role === "content-manager") {
    return (
      <NavbarShell>
        <NavbarLogo href="/admin/dashboard" />

        <NavbarLinks>
          <NavLink
            href="/admin/dashboard"
            label="Dashboard"
          />

          <NavLink
            href="/courses"
            label="Courses"
          />
        </NavbarLinks>

        <LogoutButton
          onClick={handleLogout}
        />
      </NavbarShell>
    );
  }

  // ==========================================
  // STUDENT
  // ==========================================

  if (role === "student") {
    return (
      <NavbarShell>
        <NavbarLogo href="/" />

        <NavbarLinks>
          <NavLink
            href="/"
            label="Home"
          />

          <NavLink
            href="/courses"
            label="Courses"
          />

          <NavLink
            href="/my-courses"
            label="My Courses"
          />
        </NavbarLinks>

        <LogoutButton
          onClick={handleLogout}
        />
      </NavbarShell>
    );
  }

  // ==========================================
  // INSTRUCTOR
  // ==========================================

  if (role === "instructor") {
    return (
      <NavbarShell>
        <NavbarLogo href="/instructor/dashboard" />

        <NavbarLinks>
          <NavLink
            href="/instructor/dashboard"
            label="Dashboard"
          />

          <NavLink
            href="/courses"
            label="Courses"
          />

          <NavLink
            href="/instructor/dashboard/create-course"
            label="Create Course"
          />
        </NavbarLinks>

        <LogoutButton
          onClick={handleLogout}
        />
      </NavbarShell>
    );
  }

  // ==========================================
  // FALLBACK
  // ==========================================

  return (
    <NavbarShell>
      <NavbarLogo href="/" />

      <NavbarLinks>
        <NavLink
          href="/"
          label="Home"
        />

        <NavLink
          href="/courses"
          label="Courses"
        />
      </NavbarLinks>

      <LogoutButton
        onClick={handleLogout}
      />
    </NavbarShell>
  );
}

// ==========================================
// NAVBAR SHELL
// ==========================================

function NavbarShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#050505]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-2 px-3 sm:h-[72px] sm:gap-4 sm:px-6 lg:px-10">
        {children}
      </div>
    </nav>
  );
}

// ==========================================
// LOGO
// ==========================================

function NavbarLogo({
  href,
}: {
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex shrink-0 items-center gap-2"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f15a24] text-sm font-black text-white shadow-lg shadow-[#f15a24]/10 transition group-hover:bg-[#d94b1f] sm:h-9 sm:w-9">
        L
      </span>

      <span className="hidden text-lg font-bold tracking-tight text-white xs:block sm:block">
        LMS
      </span>
    </Link>
  );
}

// ==========================================
// NAV LINKS
// ==========================================

function NavbarLinks({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="mx-auto flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.025] p-1 scrollbar-none">
        {children}
      </div>
    </div>
  );
}

// ==========================================
// NAV LINK
// ==========================================

function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="shrink-0 whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-medium text-gray-400 transition hover:bg-white/[0.06] hover:text-white sm:px-4 sm:text-sm"
    >
      {label}
    </Link>
  );
}

// ==========================================
// LOGOUT
// ==========================================

function LogoutButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-xs font-medium text-gray-300 transition hover:border-[#f15a24]/40 hover:bg-[#f15a24]/[0.06] hover:text-white sm:px-4 sm:py-2.5 sm:text-sm"
    >
      Logout
    </button>
  );
}