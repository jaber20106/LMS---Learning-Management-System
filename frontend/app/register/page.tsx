"use client";

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
  const [confirmPassword, setConfirmPassword] = useState("");

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
      setMessage("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Creating your account...");

      const response = await fetch(
        "http://localhost:1337/api/auth/local/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      console.log("Register API:", data);

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
      console.error("Registration error:", error);

      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
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
        <h1>Create Account</h1>

        <p style={{ marginTop: "10px" }}>
          Create your LMS student account.
        </p>

        <form
          onSubmit={handleRegister}
          style={{
            marginTop: "30px",
          }}
        >
          {/* Name */}
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="name">
              Full Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
              placeholder="Enter your full name"
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                marginTop: "8px",
              }}
            />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="phone">
              Phone Number
            </label>

            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              required
              placeholder="Enter your phone number"
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                marginTop: "8px",
              }}
            />
          </div>

          {/* Username */}
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              required
              placeholder="Choose a username"
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                marginTop: "8px",
              }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              placeholder="Enter your email"
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
              placeholder="Create a password"
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                marginTop: "8px",
              }}
            />
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              required
              placeholder="Confirm your password"
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                marginTop: "8px",
              }}
            />
          </div>

          {/* Register button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 18px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <p style={{ marginTop: "20px" }}>
            {message}
          </p>
        )}

        {/* Login link */}
        <p style={{ marginTop: "25px" }}>
          Already have an account?{" "}
          <Link href="/login">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}