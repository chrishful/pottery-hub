import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import AddPost from "../components/AddPost";
import { Plus } from "lucide-react";
import Post from "../components/Post";
import PostSkeleton from "../components/SkeletonPost";
import { useProfile } from "../profile/ProfileContext";

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [session, setSession] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const { profile, updateProfile, loading: loadingProfile } = useProfile();

  // Load posts on page load
  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle auth session
  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function fetchPosts() {
    setLoadingPosts(true);

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      setPosts(data);
    }

    console.log(profile);
    setLoadingPosts(false);
  }

  async function deletePost(post) {
    console.log("Deleting post:", post.id);

    const { error } = await supabase.from("posts").delete().eq("id", post.id);

    if (error) {
      console.error("Post delete error:", error);
      return;
    }

    if (post.image) {
      const imagePath = post.image.split(
        "/storage/v1/object/public/pottery-images/",
      )[1];

      const { error: storageError } = await supabase.storage
        .from("pottery-images")
        .remove([imagePath]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
      }
    }

    fetchPosts();
  }

  return (
    <div className="container">
      <h1 className="title">Pottery Hub</h1>

      {/* Add post button */}
      {session && (
        <button
          className="floating-button add-button"
          onClick={() => setAddOpen(true)}
        >
          <Plus size={30} />
        </button>
      )}

      {/* Add post drawer */}
      {addOpen && session && (
        <>
          <div className="backdrop" onClick={() => setAddOpen(false)}></div>

          <div className="drawer add-drawer">
            <AddPost
              session={session}
              fetchPosts={fetchPosts}
              setAddOpen={setAddOpen}
            />

            <button className="close-btn" onClick={() => setAddOpen(false)}>
              Close
            </button>
          </div>
        </>
      )}

      {/* Feed */}
      <div className="feed">
        {loadingPosts && (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        )}

        {!loadingPosts && posts.length === 0 && (
          <p className="no-posts">Looks like there are no posts. *crickets*</p>
        )}

        {!loadingPosts &&
          posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              session={session}
              deletePost={deletePost}
            />
          ))}
      </div>
    </div>
  );
}
