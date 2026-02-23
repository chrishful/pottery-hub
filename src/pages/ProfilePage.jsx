import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams(); // dynamic route: /profile/:userId
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      let idToFetch = userId;

      // If no userId in URL, use the signed-in user
      if (!idToFetch) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          navigate("/"); // redirect if not signed in
          return;
        }

        idToFetch = user.id;
      }

      // Fetch profile from Supabase
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", idToFetch)
        .single();

      if (!error) setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [navigate, userId]);

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
            alt={profile.username}
            className="profile-avatar"
          />
        ) : (
          <div className="profile-avatar placeholder">
            {profile.username?.[0]?.toUpperCase() || <User size={30} />}
          </div>
        )}

        <h2>{profile.display_name || profile.username}</h2>
        <p className="username">@{profile.username}</p>
        {profile.phone && <p className="phone">{profile.phone}</p>}
      </div>
    </div>
  );
}
