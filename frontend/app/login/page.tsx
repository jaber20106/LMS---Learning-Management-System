"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
        setMessage(data?.error?.message || "Login failed");
        return;
      }

      // Save JWT token
      localStorage.setItem("lms_token", data.jwt);

      setMessage(`Welcome, ${data.user.username}!`);

      // Redirect to courses page
      setTimeout(() => {
        router.push("/courses");
      }, 500);
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "60px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        <h1>Login</h1>

        <form
          onSubmit={handleLogin}
          style={{
            marginTop: "30px",
          }}
        >
          {/* Identifier */}
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="identifier">
              Email or Username
            </label>

            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(event) =>
                setIdentifier(event.target.value)
              }
              required
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                marginTop: "8px",
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                marginTop: "8px",
              }}
            />
          </div>

          {/* Login button */}
          <button
            type="submit"
            style={{
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </form>

        {/* Message */}
        {message && (
          <p style={{ marginTop: "20px" }}>
            {message}
          </p>
        )}
      </div>
    </main>
  );
}