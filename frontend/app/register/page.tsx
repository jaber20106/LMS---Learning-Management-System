"use client";

import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("Registering...");

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

    if (!response.ok) {
      setMessage(data?.error?.message || "Registration failed");
      return;
    }

    setMessage("Registration successful!");
    console.log(data);
  }

  return (
    <main style={{ padding: "40px", maxWidth: "500px", margin: "0 auto" }}>
      <h1>Create Account</h1>

      <form onSubmit={handleRegister} style={{ marginTop: "30px" }}>
        <div style={{ marginBottom: "20px" }}>
          <label>Username</label>

          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "8px",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "8px",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "8px",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "10px 18px",
            cursor: "pointer",
          }}
        >
          Register
        </button>
      </form>

      {message && (
        <p style={{ marginTop: "20px" }}>
          {message}
        </p>
      )}
    </main>
  );
}