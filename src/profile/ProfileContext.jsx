import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "../supabase";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 3. Load profile from Supabase on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.log("No active session");
        setLoading(false);
        return;
      }

      const userId = session.user.id;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) console.error("Profile fetch error:", error);
      else setProfile(data);
      console.log("Fetched profile:", data);

      setLoading(false);
    };
    console.log("ProfileContext mounted, fetching profile...");
    fetchProfile();

    // Listen for sign in / sign out / token refresh
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfile(session?.user?.id ?? null);
    });

    // Cleanup listener on unmount
    return () => subscription.unsubscribe();
  }, []);

  const updateProfile = async (updates) => {
    if (!profile) return;

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", profile.id)
      .single();

    if (error) console.error(error);
    else setProfile(data);
    console.log(data);
  };

  return (
    <ProfileContext.Provider
      value={{ profile, setProfile, updateProfile, loading }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
