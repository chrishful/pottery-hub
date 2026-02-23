import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import AddPost from "../components/AddPost";
import { User, Plus } from "lucide-react";
import Auth from "../components/Auth";
import Comments from "../components/Comments";
import Post from "../components/Post";

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [session, setSession] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    // so notes- basically useEffect runs once before the component renders ([]), and then we call getSession, then sets the session locally.
    const session = supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    // Then it basically creates a listener so that if the auth state changes, it refreshes.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert("Error signing in: " + error.message);
    else setAuthOpen(false);
  }

  async function fetchPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setPosts(data);
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
    <div className="container">
      <h1 className="title">Pottery Hub</h1>

      {/* Bottom-right add (+) icon */}
      {session && (
        <button
          className="floating-button add-button"
          onClick={() => setAddOpen(!addOpen)}
        >
          <Plus size={30} />
        </button>
      )}

      {/* AddPost Drawer */}
      {addOpen && session && (
        <>
          <div className="backdrop" onClick={() => setAddOpen(!addOpen)}></div>
          <div className="drawer add-drawer">
            <AddPost
              session={session}
              fetchPosts={fetchPosts}
              setAddOpen={setAddOpen}
            />
            <button className="close-btn" onClick={() => setAddOpen(!addOpen)}>
              Close
            </button>
          </div>
        </>
      )}

      {/* Feed */}
      <div className="feed">
        {console.log(posts)}
        {posts.length == 0 && (
          <p className="no-posts">Looks like there are no posts. *crickets*</p>
        )}
        {posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            session={session}
            deletePost={deletePost}
          />
        ))}
      </div>
      {/* Add Post Drawer */}
      {addOpen && session && (
        <>
          <div className="backdrop" onClick={() => setAddOpen(!addOpen)}></div>
          <div className="drawer add-drawer">
            <AddPost
              session={session}
              fetchPosts={fetchPosts}
              setAddOpen={setAddOpen}
            />
            <button className="close-btn" onClick={() => setAddOpen(!addOpen)}>
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
}
