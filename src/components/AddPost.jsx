import { useState } from "react";
import { ImagePlus, Loader } from "lucide-react";
import { supabase } from "../supabase";
import { useProfile } from "../profile/ProfileContext";

export default function AddPost({ session, fetchPosts, setAddOpen }) {
  const { profile } = useProfile();

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const resetForm = () => {
    setTitle("");
    setArtist("");
    setDescription("");
    setFile(null);
    setPreview(null);
  };

  async function addPost() {
    if (!file) return alert("Please select an image");
    if (uploading) return;

    setUploading(true);

    const fileName = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("pottery-images")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      setUploading(false);
      return alert("Upload failed: " + uploadError.message);
    }

    const { data } = supabase.storage
      .from("pottery-images")
      .getPublicUrl(fileName);

    const { error: insertError } = await supabase.from("posts").insert([
      {
        title,
        artist: artist.trim()
          ? `${artist.trim()} - posted by ${profile.display_name}`
          : profile.display_name,
        image: data.publicUrl,
        description,
        user_id: session.user.id,
      },
    ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      setUploading(false);
      return alert("Post failed: " + insertError.message);
    }

    resetForm();
    await fetchPosts();
    setAddOpen(false);
    setUploading(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="add-post-form">
      {uploading ? (
        <div className="upload-loading">
          <Loader size={32} className="upload-spinner" />
          <span>Uploading your post...</span>
        </div>
      ) : (
        <>
          <label
            className="image-upload-area"
            style={preview ? { padding: 0, border: "none" } : {}}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="image-preview" />
            ) : (
              <>
                <ImagePlus size={32} color="var(--primary-color)" />
                <span>Click to upload a photo</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleFile} hidden />
          </label>

          <div className="add-post-fields">
            <input
              className="add-post-input"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="add-post-input"
              placeholder={
                profile ? `Artist (e.g. ${profile.display_name})` : "Artist"
              }
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            />
            <textarea
              className="add-post-textarea"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button className="add-post-btn" onClick={addPost}>
            Post
          </button>
        </>
      )}
    </div>
  );
}
