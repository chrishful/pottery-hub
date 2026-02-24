import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";
import SignInPage from "./pages/SignInPage";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import AddPost from "./components/AddPost";
import Auth from "./components/Auth";
import { User, Plus } from "lucide-react";

export default function App() {
  const [session, setSession] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => setSession(session),
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function fetchPosts() {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: true });
    setPosts(data);
  }

  async function deletePost(post) {
    console.log("Deleting post:", post.id);
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) console.error("Post delete error:", error);
    else {
      if (post.image) {
        const imagePath = post.image.split(
          "/storage/v1/object/public/pottery-images/",
        )[1];
        const { error: storageError } = await supabase.storage
          .from("pottery-images")
          .remove([imagePath]);

        if (storageError) console.error("Storage delete error:", storageError);
      }
    }
    fetchPosts();
  }

  return (
    <BrowserRouter>
      <div className="container">
        {/* Floating buttons */}
        <button
          className="floating-button user-button"
          onClick={() => setAuthOpen(!addOpen ? !authOpen : authOpen)}
        >
          <User size={30} />
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
                    <button>
                      <Link
                        to="/profile"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        Go to Profile
                      </Link>
                    </button>
                    <button
                      className="signout-btn"
                      onClick={() => supabase.auth.signOut()}
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
              <button className="close-btn" onClick={() => setAuthOpen(false)}>
                Close
              </button>
            </div>
          </>
        )}

        {/* Routes */}
        <Routes>
          <Route
            path="/"
            element={
              <FeedPage
                session={session}
                posts={posts}
                fetchPosts={fetchPosts}
              />
            }
          />
          <Route path="/profile" element={<ProfilePage session={session} deletePost={deletePost} fetchPosts={fetchPosts} />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/profile/:userId" element={<ProfilePage session={session} deletePost={deletePost} fetchPosts={fetchPosts} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
