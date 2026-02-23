import { useState } from "react";
import { supabase } from "../supabase";

export default function AddPost(props) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function addPost() {
    if (!file) return alert("Please select an image");

    const fileName = `${Date.now()}-${file.name}`;

    if (uploading) return;
    setUploading(true);

    const { error: uploadError } = await supabase.storage
      .from("pottery-images")
      .upload(fileName, file);

    if (uploadError) {
      console.error(uploadError);
      setUploading(false);
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
        description,
        user_id: props.session.user.id,
      },
    ]);

    setTitle("");
    setArtist("");
    setDescription("");
    setFile(null);

    await props.fetchPosts();
    props.setAddOpen(false);
    setUploading(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="form">
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        placeholder="Artist"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={addPost}>Add Post</button>
    </div>
  );
}
