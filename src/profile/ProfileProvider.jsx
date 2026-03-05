import { useState, useEffect } from "react";
import { ProfileContext } from "./ProfileContext";

export function ProfileProvider({ children }) {
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
          navigate("/");
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

      if (!error) {
        setProfile(data);
        await fetchPosts(idToFetch);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [navigate, userId]);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
}
