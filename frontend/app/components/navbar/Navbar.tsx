"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Role = "student" | "instructor" | "";

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
    function readSavedRole(): Role {
      const savedRole = localStorage.getItem("lms_role");

      if (savedRole === "student") {
        return "student";
      }

      if (savedRole === "instructor") {
        return "instructor";
      }

      return "";
    }

    async function loadUser() {
      const token = localStorage.getItem("lms_token");

      /*
       * No token = logged out
       */
      if (!token) {
        setRole("");
        setChecking(false);
        return;
      }

      /*
       * First use the role saved during login.
       *
       * This is important because the Strapi /users/me
       * response in your project is not returning role.
       */
      const savedRole = readSavedRole();

      if (savedRole) {
        setRole(savedRole);
        setChecking(false);
      }

      /*
       * Try to refresh user information from Strapi.
       *
       * IMPORTANT:
       * If this request does not return role, we DO NOT
       * remove the token or saved role.
       */
      try {
        const response = await fetch(
          "http://localhost:1337/api/users/me?populate=role",
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
          console.warn(
            "Could not load user information:",
            response.status
          );

          /*
           * Do not logout the user here.
           *
           * If we already have lms_role, keep using it.
           */
          if (!savedRole) {
            setRole("");
          }

          setChecking(false);
          return;
        }

        const user: User = await response.json();

        console.log("NAVBAR USER:", user);
        console.log("NAVBAR ROLE:", user?.role?.name);

        const actualRole =
          user?.role?.name?.trim().toLowerCase() || "";

        /*
         * If Strapi gives us the role, update it.
         */
        if (
          actualRole === "student" ||
          actualRole === "instructor"
        ) {
          localStorage.setItem(
            "lms_role",
            actualRole
          );

          localStorage.setItem(
            "lms_user",
            JSON.stringify(user)
          );

          setRole(actualRole);
        } else {
          /*
           * Strapi did not return role.
           *
           * Keep the previously saved role.
           */
          if (savedRole) {
            setRole(savedRole);
          }
        }
      } catch (error) {
        console.error(
          "Navbar user error:",
          error
        );

        /*
         * Never destroy a working login just because
         * the user-information request failed.
         */
        if (savedRole) {
          setRole(savedRole);
        }
      } finally {
        setChecking(false);
      }
    }

    window.addEventListener("lms-auth-changed", loadUser);
    loadUser();

    return () => {
      window.removeEventListener("lms-auth-changed", loadUser);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_role");
    localStorage.removeItem("lms_user");

    setRole("");

    router.replace("/");
  }

  /*
   * LOGGED OUT NAVBAR
   */
  if (!checking && !role) {
    return (
      <nav style={navStyle}>
        <Link href="/" style={logoStyle}>
          LMS
        </Link>

        <div style={navLinksStyle}>
          <Link href="/" style={linkStyle}>
            Home
          </Link>

          <Link href="/courses" style={linkStyle}>
            Courses
          </Link>

          <Link href="/login" style={linkStyle}>
            Login
          </Link>

          <Link href="/register" style={linkStyle}>
            Register
          </Link>
        </div>
      </nav>
    );
  }

  /*
   * While checking, keep the navbar stable.
   */
  if (checking && !role) {
    return (
      <nav style={navStyle}>
        <Link href="/" style={logoStyle}>
          LMS
        </Link>

        <div style={navLinksStyle}>
          <Link href="/" style={linkStyle}>
            Home
          </Link>

          <Link href="/courses" style={linkStyle}>
            Courses
          </Link>
        </div>
      </nav>
    );
  }

  /*
   * STUDENT NAVBAR
   */
  if (role === "student") {
    return (
      <nav style={navStyle}>
        <Link href="/" style={logoStyle}>
          LMS
        </Link>

        <div style={navLinksStyle}>
          <Link href="/" style={linkStyle}>
            Home
          </Link>

          <Link
            href="/courses"
            style={linkStyle}
          >
            Courses
          </Link>

          <Link
            href="/my-courses"
            style={linkStyle}
          >
            My Courses
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            style={logoutStyle}
          >
            Logout
          </button>
        </div>
      </nav>
    );
  }

  /*
   * INSTRUCTOR NAVBAR
   */
  if (role === "instructor") {
    return (
      <nav style={navStyle}>
        <Link
          href="/instructor/dashboard"
          style={logoStyle}
        >
          LMS
        </Link>

        <div style={navLinksStyle}>
          <Link
            href="/instructor/dashboard"
            style={linkStyle}
          >
            Dashboard
          </Link>

          <Link
            href="/courses"
            style={linkStyle}
          >
            Courses
          </Link>

          <Link
            href="/instructor/dashboard/create-course"
            style={linkStyle}
          >
            Create Course
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            style={logoutStyle}
          >
            Logout
          </button>
        </div>
      </nav>
    );
  }

  /*
   * Fallback
   */
  return (
    <nav style={navStyle}>
      <Link href="/" style={logoStyle}>
        LMS
      </Link>

      <div style={navLinksStyle}>
        <Link href="/" style={linkStyle}>
          Home
        </Link>

        <Link
          href="/courses"
          style={linkStyle}
        >
          Courses
        </Link>

        <Link
          href="/login"
          style={linkStyle}
        >
          Login
        </Link>

        <Link
          href="/register"
          style={linkStyle}
        >
          Register
        </Link>
      </div>
    </nav>
  );
}

const navStyle = {
  height: "64px",
  borderBottom: "1px solid #292929",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 32px",
  boxSizing: "border-box" as const,
};

const logoStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "20px",
  fontWeight: "800",
};

const navLinksStyle = {
  display: "flex",
  gap: "22px",
  alignItems: "center",
};

const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "14px",
};

const logoutStyle = {
  padding: "9px 14px",
  borderRadius: "7px",
  border: "1px solid #444",
  background: "transparent",
  color: "white",
  cursor: "pointer",
};