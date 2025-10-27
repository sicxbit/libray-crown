import { useState } from "react";
import { db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function PolicyUpload() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [complianceTags, setComplianceTags] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file || !title) return alert("Please enter a title and select a file.");

    setLoading(true);
    try {
      // 1️⃣ Upload to Firebase Storage
      const fileRef = ref(storage, `policies/${Date.now()}-${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      // 2️⃣ Save metadata to Firestore
      await addDoc(collection(db, "policies"), {
        title,
        fileUrl: url,
        isPublic,
        complianceTags: complianceTags.split(",").map(tag => tag.trim()),
        createdAt: serverTimestamp(),
      });

      alert(`Uploaded "${title}" successfully!`);
      setTitle("");
      setFile(null);
      setComplianceTags("");
      setIsPublic(true);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Error uploading file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow border border-gray-200 max-w-md mx-auto">
      <h3 className="font-semibold mb-4 text-gray-700 text-lg">Upload New Policy</h3>

      <input
        type="text"
        placeholder="Policy title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border border-gray-300 p-2 rounded w-full mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
      />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-3"
      />

      <div className="flex items-center mb-3">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="mr-2"
        />
        <label className="text-sm text-gray-600">Make policy public</label>
      </div>

      <input
        type="text"
        placeholder="Compliance tags (comma-separated)"
        value={complianceTags}
        onChange={(e) => setComplianceTags(e.target.value)}
        className="border border-gray-300 p-2 rounded w-full mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className={`w-full py-2 rounded-lg text-white transition ${
          loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
