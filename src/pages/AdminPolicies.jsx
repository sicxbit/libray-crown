import React, { useRef, useState } from "react";
import { uploadPolicy } from "../components/UploadPolicy";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import PolicyList from "../components/PolicyList";

export default function AdminUpload() {
  const [policyName, setPolicyName] = useState("");
  const [policyAttribute, setPolicyAttribute] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); 
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("❌ Logout failed:", err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !policyName.trim()) {
      setStatus("❌ Please fill all fields and choose a file.");
      return;
    }

    setStatus("⏳ Uploading...");
    const result = await uploadPolicy(file, policyName, policyAttribute);

    if (result.success) {
      setStatus("✅ Uploaded!");
      setRefreshKey((prev) => prev + 1);

      setFile(null);
      setPolicyName("");
      setPolicyAttribute("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      setStatus("❌ " + result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          Logout
        </button>
      </div>

      <form
        onSubmit={handleUpload}
        className="p-6 bg-white shadow-md rounded-lg max-w-md mx-auto mt-10 space-y-4"
      >
        <input
          type="text"
          placeholder="Policy Name"
          value={policyName}
          onChange={(e) => setPolicyName(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Policy Attribute"
          value={policyAttribute}
          onChange={(e) => setPolicyAttribute(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => setFile(e.target.files[0])}
          ref={fileInputRef}
          className="border p-2 w-full rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 w-full rounded hover:bg-blue-700"
        >
          Upload
        </button>
        {status && <p className="text-center mt-2">{status}</p>}
      </form>

      {/* Pass refreshKey to PolicyList */}
      <div>
        <PolicyList isAdmin={true} refreshKey={refreshKey} />
      </div>
    </div>
  );
}
