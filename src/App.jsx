import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import "./index.css";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setPosts(data);
  }

    async function addPost() {
      if (!file) return alert("Please select an image");

      const fileName = `${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("pottery-images")
        .upload(fileName, file);

      if (uploadError) {
        console.error(uploadError);
        return alert("Upload failed");
      }

      const { data } = supabase.storage
        .from("pottery-images")
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;

      await supabase.from("posts").insert([
        {
          title,
          artist,
          image: publicUrl,
          description
        }
      ]);

      setTitle("");
      setArtist("");
      setDescription("");
      setFile(null);

      fetchPosts();
    }

    async function deletePost(post) {
        console.log("Deleting post:", post);
      if (post.image) {
        const imagePath = post.image.split("/storage/v1/object/public/pottery-images/")[1];
        console.log(imagePath);
        const { error: storageError } = await supabase.storage
          .from("pottery-images")
          .remove([imagePath]);

        if (storageError) console.error("Storage delete error:", storageError);
      }

      const { error } = await supabase.from("posts").delete().eq("id", post.id);
      if (error) console.error("Post delete error:", error);

      fetchPosts();
    }

  return (
    <div className="container">
      <h1>Pottery Hub</h1>

      <div className="form">
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Artist" value={artist} onChange={e => setArtist(e.target.value)} />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <button onClick={addPost}>Add Post</button>
      </div>

      {posts.map(post => (
        <div key={post.id} className="card">
          <img src={post.image} alt={post.title} />
          <div className="content">
            <h2>{post.title}</h2>
            <p className="artist">by {post.artist}</p>
            <p>{post.description}</p>
            <button onClick={() => deletePost(post)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}