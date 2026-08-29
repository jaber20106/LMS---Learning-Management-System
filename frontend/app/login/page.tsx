"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("Logging in...");

    try {
      const response = await fetch(
        "http://localhost:1337/api/auth/local",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
          data?.error?.message || "Login failed."
        );
        setLoading(false);
        return;
      }

      if (!data?.jwt) {
        setMessage("Login token was not received.");
        setLoading(false);
        return;
      }

      // Save JWT
      localStorage.setItem("lms_token", data.jwt);

      localStorage.removeItem("lms_role");

      let role = "";

      try {
        const userResponse = await fetch(
          "http://localhost:1337/api/users/me?populate=role",
          {
            headers: {
              Authorization: `Bearer ${data.jwt}`,
            },
            cache: "no-store",
          }
        );

        if (userResponse.ok) {
          const user = await userResponse.json();
          const roleName = user?.role?.name?.trim().toLowerCase();

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
        console.error("User role lookup error:", error);
      }

      if (!role) {
        localStorage.setItem(
          "lms_user",
          JSON.stringify(data.user)
        );
      }

      window.dispatchEvent(new Event("lms-auth-changed"));

      setMessage(`Welcome, ${data.user.username}!`);

      if (role === "admin") {
  router.replace("/admin/dashboard");
} else if (role === "instructor") {
  router.replace("/instructor/dashboard");
} else {
  router.replace("/");
}
    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        "Something went wrong. Please try again."
      );

      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "80px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "35px" }}>
          <p
            style={{
              color: "#888",
              marginBottom: "8px",
            }}
          >
            LMS Account
          </p>

          <h1
            style={{
              fontSize: "38px",
              margin: 0,
            }}
          >
            Login
          </h1>

          <p
            style={{
              color: "#999",
              marginTop: "10px",
            }}
          >
            Sign in to continue learning.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          style={{
            border: "1px solid #333",
            borderRadius: "12px",
            padding: "28px",
          }}
        >
          <div style={{ marginBottom: "22px" }}>
            <label
              htmlFor="identifier"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Email or Username
            </label>

            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(event) =>
                setIdentifier(event.target.value)
              }
              placeholder="Enter email or username"
              required
              disabled={loading}
              style={{
                display: "block",
                width: "100%",
                boxSizing: "border-box",
                padding: "13px",
                borderRadius: "8px",
                border: "1px solid #444",
                background: "#111",
                color: "white",
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              required
              disabled={loading}
              style={{
                display: "block",
                width: "100%",
                boxSizing: "border-box",
                padding: "13px",
                borderRadius: "8px",
                border: "1px solid #444",
                background: "#111",
                color: "white",
              }}
            />
          </div>

          {message && (
            <div
              style={{
                marginBottom: "20px",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid #333",
                color: "#ccc",
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              background: "white",
              color: "black",
              fontWeight: "700",
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}