import { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signIn");
  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
    username: "",
    phone: "",
    profilePic: null,
  });
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "signIn") {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) return alert(error.message);

      navigate("/");
      return;
    }

    // 🔥 SIGN UP FLOW
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (error) return alert(error.message);

    const user = data.user;

    if (!user) {
      return alert("User creation failed. Check email confirmation settings.");
    }

    let profilePicUrl = null;

    if (form.profilePic) {
      const fileExt = form.profilePic.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-pics")
        .upload(fileName, form.profilePic);

      if (uploadError) return alert(uploadError.message);

      const { data: publicUrlData } = supabase.storage
        .from("profile-pics")
        .getPublicUrl(fileName);

      profilePicUrl = publicUrlData.publicUrl;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      username: form.username,
      display_name: form.displayName,
      phone: form.phone,
      profile_pic: profilePicUrl,
    });

    if (profileError) return alert(profileError.message);

    navigate("/");

    setForm({
      email: "",
      password: "",
      displayName: "",
      username: "",
      phone: "",
      profilePic: null,
    });

    setPreview(null);
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <h2 className="auth-title">
          {mode === "signIn" ? "Sign In" : "Sign Up"}
        </h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "signUp" && (
            <>
              <div className="profile-pic-upload">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="profile-preview"
                  />
                ) : (
                  <div className="profile-placeholder">Profile Pic</div>
                )}
                <input
                  type="file"
                  name="profilePic"
                  accept="image/*"
                  onChange={handleChange}
                />
              </div>

              <input
                type="text"
                name="displayName"
                placeholder="Display Name"
                value={form.displayName}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone (optional)"
                value={form.phone}
                onChange={handleChange}
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

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
