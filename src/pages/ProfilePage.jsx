import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error) setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  if (loading) return <div className="container">Loading...</div>;
  if (!profile) return <div className="container">Profile not found.</div>;

  return (
    <div className="profile-container">
      {/* Floating Back Button */}
      <button className="floating-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={22} />
      </button>

      <div className="profile-card">
        {profile.profile_pic ? (
          <img
            src={profile.profile_pic}
            alt="Profile"
            className="profile-avatar"
          />
        ) : (
          <div className="profile-avatar placeholder">
            {profile.username?.[0]?.toUpperCase()}
          </div>
        )}

        <h2>{profile.display_name || profile.username}</h2>
        <p className="username">@{profile.username}</p>
        {profile.phone && <p className="phone">{profile.phone}</p>}
      </div>
    </div>
  );
}
