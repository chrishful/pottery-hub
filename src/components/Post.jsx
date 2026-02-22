import { User, Heart, Plus } from "lucide-react";
import { useState } from "react";
import { supabase } from "../supabase";
import { useEffect } from "react";

export default function Post(props) {
    var post = props.post;
    var session = props.session;
    const [liked, setLiked] = useState(false);

      useEffect(() => {
        if (!session) return;
        async function checkLike() {
          const { data, error } = await supabase
            .from("post_likes")
            .select("*")
            .eq("user_id", session.user.id)
            .eq("post_id", post.id)
            .single();
          setLiked(!!data);
        }
        checkLike();
      }, [post.id, session]);

      const toggleLike = async () => {
        if (!session) return;

        if (liked) {
          await supabase
            .from("post_likes")
            .delete()
            .eq("user_id", session.user.id)
            .eq("post_id", post.id);
          setLiked(false);
        } else {
          await supabase
            .from("post_likes")
            .insert({ user_id: session.user.id, post_id: post.id });
          setLiked(true);
        }
      };

    return (
           <div key={post.id} className="card">
                 <div className="card-content">
                     <div className="profile-section-on-card">
                         <div className="profile-section-on-card-left">
                         <div className="user-icon">
                            <User className="user-icon-svg" size={30} />
                         </div>
                          <h2 className="card-artist">{post.artist}</h2>
                            </div>
                        <Heart
                          className={liked ? "like-icon-on-card-in-feed liked" : "like-icon-on-card-in-feed"}
                          size={20}
                          onClick={() => toggleLike()}
                        />
                     </div>
                   <h3 className="card-title">{post.title}</h3>
                   <img src={post.image} alt={post.title} className="card-image" />
                    <p className="card-description">{post.description}</p>
               </div>
               <div className ="card-actions">
                 {session && post.user_id === session.user.id && (
                   <button className="delete-btn" onClick={() => props.deletePost(post)}>
                     Delete
                   </button>
                 )}
             </div>
             </div>
           );
}