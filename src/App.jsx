import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import "./index.css";
import AddPost from "./components/AddPost";
import { User } from "lucide-react";
import { Plus } from "lucide-react";
import Auth from "./components/Auth";

export default function App() {
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
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

  async function signUp(email, password, name) {
        const { error } = await supabase.auth.signUp(
          {
            email,
            password,
          },
          {
            data: {
              full_name: name,
            },
          }
        );
        if (error) alert("Error signing up: " + error.message);
    }

    async function signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
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
              const imagePath = post.image.split("/storage/v1/object/public/pottery-images/")[1];
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

         {/* Top-right user icon */}
         <button className="floating-button user-button" onClick={() => setAuthOpen(!addOpen ? !authOpen : authOpen)}>
           <User size={30} />
         </button>

         {/* Bottom-right add (+) icon */}
         {session && (
           <button className="floating-button add-button" onClick={() => setAddOpen(!addOpen)}>
             <Plus size={30} />
           </button>
         )}

         {/* Auth Drawer */}
         {authOpen && (
           <>
             <div className="backdrop" onClick={() => setAuthOpen(!authOpen)}></div>
             <div className="drawer auth-drawer">
                 <button className="floating-button user-button-auth-drawer" onClick={() => setAuthOpen(!authOpen)}>
                   <User size={30} />
                 </button>
               {!session ? (
                 <Auth signUp={signUp} signIn={signIn} />
               ) : (
                 <button className="signout-btn" onClick={() => supabase.auth.signOut()}>
                   Sign Out
                 </button>
               )}
               <button className="close-btn" onClick={() => setAuthOpen(false)}>
                 Close
               </button>
             </div>
           </>
         )}

         {/* AddPost Drawer */}
         {addOpen && session && (
           <>
             <div className="backdrop" onClick={() => setAddOpen(!addOpen)}></div>
             <div className="drawer add-drawer">
               <AddPost session={session} fetchPosts={fetchPosts} setAddOpen={setAddOpen}/>
               <button className="close-btn" onClick={() => setAddOpen(!addOpen)}>
                 Close
               </button>
             </div>
           </>
         )}

         {/* Feed */}
         <div className="feed">
             {console.log(posts)}
           {posts.length == 0 && <p className="no-posts">Looks like there are no posts. *crickets*</p>}
           {posts.map((post) => (
             <div key={post.id} className="card">
               <img src={post.image} alt={post.title} className="card-image" />
               <div className="card-content">
                 <h2 className="card-title">{post.title}</h2>
                 <p className="card-artist">by {post.artist}</p>
                 <p className="card-description">{post.description}</p>
                 {session && post.user_id === session.user.id && (
                   <button className="delete-btn" onClick={() => deletePost(post)}>
                     Delete
                   </button>
                 )}
               </div>
             </div>
           ))}
         </div>
       </div>
     );
  }