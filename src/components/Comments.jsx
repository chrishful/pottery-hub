import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useProfile } from "../profile/ProfileContext";

export default function Comments(props) {
  const [post, setPost] = useState(props.post);
  const [newCommentText, setNewCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const { profile } = useProfile();

  function deleteComment(comment) {
    if (!props.session)
      return alert("You must be signed in to delete comments");
    supabase
      .from("comments")
      .delete()
      .eq("id", comment.id)
      .eq("user_id", props.session.user.id)
      .then(({ error }) => {
        if (error) {
          alert("Error deleting comment: " + error.message);
        } else {
          fetchComments();
        }
      });
  }

  function addComment() {
    if (!props.session) return alert("You must be signed in to comment");
    supabase
      .from("comments")
      .insert({
        text: newCommentText,
        post_id: post.id,
        user_id: props.session.user.id,
        user_display_name: profile.display_name ?? "John Doe",
      })
      .then(({ error }) => {
        if (error) {
          alert("Error adding comment: " + error.message);
        } else {
          fetchComments();
        }
      });
  }
  async function fetchComments() {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", post.id)
      .order("created_at", { ascending: false });
    console.log(error);
    if (!error) {
      console.log(data);
      setComments(data);
    }
  }

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <div className="comments-section">
      {props.session && (
        <form
          className="add-comment-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (newCommentText.trim() !== "") {
                addComment(post.id, newCommentText, props.session);
                setNewCommentText("");
            }
          }}
        >
          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Write a comment..."
          />
          <button className="add-comment-submit" type="submit">
            Comment
          </button>
        </form>
      )}
      <div className="comments-cards">
        {comments.map((c) => (
          <div key={c.id} className="comment-card">
            <div className="comment-name-and-date">
              <p>
                <strong>{c.user_display_name}</strong> says
              </p>
              <p className="comment-timestamp">
                on {new Date(c.created_at).toLocaleString()}
              </p>
            </div>
            <p>{c.text}</p>
            {props.session?.user.id === c.user_id && (
              <button onClick={() => deleteComment(c)}>Delete Comment</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
