import { useProfile } from "../profile/ProfileContext";
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function Sidebar({ authOpen, setAuthOpen, addOpen, session }) {
  const { profile } = useProfile();
  return (
    <div className="sidebar">
      {/* Floating buttons */}
      <button
        className="floating-button user-button"
        onClick={() => setAuthOpen(!addOpen ? !authOpen : authOpen)}
      >
        <div className="user-icon-wrapper">
          {profile?.profile_pic ? (
            <img
              src={profile.profile_pic}
              alt={profile?.username || "Profile"}
              className="user-icon-img"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <User
            size={30}
            className="user-icon-fallback"
            style={{ display: profile?.profile_pic ? "none" : "flex" }}
          />
        </div>
      </button>

      {/* Auth Drawer */}
      {authOpen && (
        <>
          <div className="backdrop" onClick={() => setAuthOpen(false)}></div>
          <div className="drawer auth-drawer">
            {!session ? (
              <button onClick={() => setAuthOpen(false)}>
                <Link
                  to="/sign-in"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Sign in or Sign Up
                </Link>
              </button>
            ) : (
              <>
                <div className="profile-and-sign-out">
                  <button
                    className="user-icon-button"
                    onClick={() => setAuthOpen(false)}
                  >
                    <Link
                      to="/profile"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div className="user-icon-wrapper">
                        {profile?.profile_pic ? (
                          <img
                            src={profile.profile_pic}
                            alt={profile?.username || "Profile"}
                            className="user-icon-img"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.nextSibling.style.display =
                                "flex";
                            }}
                          />
                        ) : null}
                        <User
                          size={30}
                          className="user-icon-fallback"
                          style={{
                            display: profile?.profile_pic ? "none" : "flex",
                          }}
                        />
                      </div>
                    </Link>
                  </button>
                  <button
                    className="close-btn"
                    onClick={() => setAuthOpen(false)}
                  >
                    Close
                  </button>
                </div>
                <button
                  className="signout-btn"
                  onClick={() => supabase.auth.signOut()}
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
