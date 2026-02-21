import { useState } from "react";

export default function Auth({ signIn, signUp }) {
  const [mode, setMode] = useState("signIn"); // "signIn" or "signUp"
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "signIn") {
      signIn(email, password);
    } else {
      signUp(email, password, name);
    }
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <h2>{mode === "signIn" ? "Sign In" : "Sign Up"}</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {mode === "signUp" && (
            <label>
              Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
           )
              }

          <button type="submit" className="submit-btn">
            {mode === "signIn" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <button
          className="toggle-mode-btn"
          onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
        >
          {mode === "signIn"
            ? "Need an account? Sign Up"
            : "Already have an account? Sign In"}
        </button>
      </div>
    </div>
  );
}