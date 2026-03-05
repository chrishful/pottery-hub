import { User, Heart, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import Comments from "./Comments";
import { Link } from "react-router-dom";

export default function Post(props) {
  var post = props.post;
  var session = props.session;
  const [liked, setLiked] = useState(false);
  const [allLikes, setAllLikes] = useState(0);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

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
    if (!session) return;

    async function checkAdmin() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setIsAdmin(false);
        return;
      }
      setIsAdmin(data.role === "ADMIN");
    }

    checkAdmin();
  }, [session]);

  useEffect(() => {
    // This is to update the number of likes on the post card
    fetchLikes();
    // This is to fetch the profile of the user who made the post, so we can display their name and profile picture on the card.
    fetchProfile();
  }, [post.id, post.user_id]);

  async function fetchLikes() {
    const { data, error } = await supabase
      .from("post_likes")
      .select("*")
      .eq("post_id", post.id);
    if (!error) {
      setAllLikes(data.length);
    }
  }

  async function fetchProfile() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", post.user_id)
      .single();
    if (!error) {
      setProfile(data);
    } else {
      console.log(error);
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
            <div className="user-icon-wrapper">
              {profile?.profile_pic ? (
                <Link to={`/profile/${profile.id}`}>
                  <img
                    src={profile.profile_pic}
                    alt={profile.username || "Profile"}
                    className="user-icon-img"
                  />
                </Link>
              ) : (
                <Link to={`/profile/${profile?.id || ""}`}>
                  <div className="user-icon-placeholder">
                    <User size={24} />
                  </div>
                </Link>
              )}
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
        {session && (post.user_id === session.user.id || isAdmin) && (
          <button className="delete-btn" onClick={() => props.deletePost(post)}>
            Delete Post
          </button>
        )}
      </div>
    </div>
  );
}
