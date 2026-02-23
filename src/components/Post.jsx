import { User, Heart, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import Comments from "./Comments";

export default function Post(props) {
  var post = props.post;
  var session = props.session;
  const [liked, setLiked] = useState(false);
  const [allLikes, setAllLikes] = useState(0);
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

  useEffect(() => {
    // This is to update the number of likes on the post card
    fetchLikes();
  }, [post.id]);

  async function fetchLikes() {
    const { data, error } = await supabase
      .from("post_likes")
      .select("*")
      .eq("post_id", post.id);
    if (!error) {
      setAllLikes(data.length);
    }
  }

  const toggleLike = async () => {
    if (!session) return;
    setLiked((prevLiked) => !prevLiked);

    if (liked) {
      await supabase
        .from("post_likes")
        .delete()
        .eq("user_id", session.user.id)
        .eq("post_id", post.id);
    } else {
      await supabase
        .from("post_likes")
        .insert({ user_id: session.user.id, post_id: post.id });
    }
    fetchLikes();
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
          <div className="profile-section-on-card-right">
            <p className="likes-count">
              {allLikes} {allLikes === 1 ? "like" : "likes"}
            </p>
            <Heart
              className={
                liked
                  ? "like-icon-on-card-in-feed liked"
                  : "like-icon-on-card-in-feed"
              }
              size={20}
              onClick={() => toggleLike()}
            />
          </div>
        </div>
        <h3 className="card-title">{post.title}</h3>
        <img src={post.image} alt={post.title} className="card-image" />
        <p className="card-description">{post.description}</p>
      </div>
      <Comments post={post} session={session} />
      <div className="card-actions">
        {session && post.user_id === session.user.id && (
          <button className="delete-btn" onClick={() => props.deletePost(post)}>
            Delete Post
          </button>
        )}
      </div>
    </div>
  );
}
