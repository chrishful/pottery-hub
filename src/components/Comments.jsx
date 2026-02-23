import React, { useState } from "react";

export default function Comments(props) {
  const [post, setPost] = useState(props.post);
  const [newCommentText, setNewCommentText] = useState("");

  function deleteComment() {
    console.log("delete comment");
  }

  function addComment() {
    console.log("add comment");
  }

  var comments = [];

  return (
    <div className="comments-section">
      {comments.map((c) => (
        <div key={c.id} className="comment-card">
          <p>
            <strong>{c.user_display_name}</strong>:
          </p>
          <p>{c.text}</p>
          {props.session?.user.id === c.user_id && (
            <button onClick={() => deleteComment(c)}>Delete</button>
          )}
        </div>
      ))}

      {props.session && (
        <form
          className="add-comment-form"
          onSubmit={(e) => {
            e.preventDefault();
            addComment(post.id, newCommentText, props.session);
            setNewCommentText("");
          }}
        >
          <input
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Write a comment..."
          />
          <button type="submit">Comment</button>
        </form>
      )}
    </div>
  );
}
