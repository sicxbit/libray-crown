import React, { useEffect, useState } from "react";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, db, storage } from "../firebase"; // adjust path as needed
import { signOut } from "firebase/auth";
import { Trash2, UploadCloud, Edit, Save, X } from "lucide-react";

export default function AdminPolicies() {
   

    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [file, setFile] = useState(null);
    const [name, setName] = useState("");
    const [covers, setCovers] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState("");

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [isReplacingFile, setIsReplacingFile] = useState(false);

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, "policies"));
            const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            // sort: newest first
            docs.sort((a, b) => (a.updatedAt?.toMillis?.() || 0) < (b.updatedAt?.toMillis?.() || 0) ? 1 : -1);
            setPolicies(docs);
        } catch (err) {
            console.error("fetchPolicies:", err);
            setError("Failed to fetch policies.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setName("");
        setCovers("");
        setUploadProgress(0);
        setEditingId(null);
        setIsReplacingFile(false);
        setError("");
    };

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        // optional: file size/type validation
        setFile(f);
    };

    // Upload new policy
    const handleUpload = async (e) => {
        e.preventDefault();
        setError("");
        if (!file && !editingId) {
            setError("Please choose a file to upload.");
            return;
        }
        if (!name) {
            setError("Please provide a document name.");
            return;
        }

        try {
            const user = auth.currentUser;
            const uploadedBy = user?.email || user?.uid || "admin";

            // If editing and not replacing file, just update metadata
            if (editingId && !isReplacingFile) {
                const docRef = doc(db, "policies", editingId);
                await updateDoc(docRef, {
                    name,
                    covers,
                    uploadedBy,
                    updatedAt: serverTimestamp(),
                });
                await fetchPolicies();
                resetForm();
                return;
            }

            // When uploading a file (new or replacing)
            const safeFileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
            const sRef = storageRef(storage, `policies/${safeFileName}`);
            const uploadTask = uploadBytesResumable(sRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    setUploadProgress(percent);
                },
                (uploadError) => {
                    console.error("upload error:", uploadError);
                    setError("File upload failed.");
                },
                async () => {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    if (editingId) {
                        // If replacing file, delete old storage object (optional)
                        const existing = policies.find((p) => p.id === editingId);
                        if (existing?.fileName) {
                            try {
                                const oldRef = storageRef(storage, `policies/${existing.fileName}`);
                                await deleteObject(oldRef);
                            } catch (delErr) {
                                // ignore deletion errors
                                console.warn("old file deletion error:", delErr);
                            }
                        }
                        const docRef = doc(db, "policies", editingId);
                        await updateDoc(docRef, {
                            name,
                            covers,
                            fileName: safeFileName,
                            url,
                            uploadedBy,
                            updatedAt: serverTimestamp(),
                        });
                    } else {
                        // create new doc
                        await addDoc(collection(db, "policies"), {
                            name,
                            covers,
                            fileName: safeFileName,
                            url,
                            uploadedBy,
                            updatedAt: serverTimestamp(),
                        });
                    }
                    await fetchPolicies();
                    resetForm();
                }
            );
        } catch (err) {
            console.error(err);
            setError("Failed to upload policy.");
        }
    };

    // Start editing an existing policy (prefill form)
    const startEdit = (policy) => {
        setEditingId(policy.id);
        setName(policy.name || "");
        setCovers(policy.covers || "");
        setFile(null);
        setIsReplacingFile(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const cancelEdit = () => resetForm();

    // Delete policy doc + file
    const handleDelete = async (policy) => {
        if (!confirm(`Delete "${policy.name}"? This cannot be undone.`)) return;
        try {
            // delete Firestore doc
            await deleteDoc(doc(db, "policies", policy.id));
            // delete storage object (best-effort)
            if (policy.fileName) {
                try {
                    const oldRef = storageRef(storage, `policies/${policy.fileName}`);
                    await deleteObject(oldRef);
                } catch (err) {
                    console.warn("delete file error:", err);
                }
            }
            await fetchPolicies();
        } catch (err) {
            console.error("delete:", err);
            setError("Failed to delete policy.");
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            // navigate to login page if needed
        } catch (err) {
            console.error("signout:", err);
        }
    };

    return (
        <div className="min-h-screen p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Admin — Policies</h1>
                    <div className="flex gap-2 items-center">
                        <button onClick={handleSignOut} className="text-sm text-red-600 hover:underline">Sign out</button>
                    </div>
                </div>

                {/* Upload / Edit Form */}
                <form onSubmit={handleUpload} className="bg-white p-5 rounded-lg shadow border">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Document Name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full border rounded px-3 py-2"
                                placeholder="Policy title (e.g., Attendant Assignment Policy)"
                                required
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Covers / Tags</label>
                            <input
                                value={covers}
                                onChange={(e) => setCovers(e.target.value)}
                                className="mt-1 block w-full border rounded px-3 py-2"
                                placeholder="Comma-separated (e.g., NAC 449.3974(7), Infection Control)"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <UploadCloud className="text-blue-600" />
                            <span className="text-sm text-gray-600">{file ? file.name : (editingId ? "Choose file to replace (optional)" : "Choose file")}</span>
                            <input type="file" accept=".pdf,.doc,.docx,.xlsx,.pptx" className="hidden" onChange={handleFileChange} />
                        </label>

                        {editingId && (
                            <label className="text-sm flex items-center gap-2">
                                <input type="checkbox" checked={isReplacingFile} onChange={(e) => setIsReplacingFile(e.target.checked)} />
                                Replace file
                            </label>
                        )}

                        <div className="ml-auto flex items-center gap-2">
                            {editingId ? (
                                <>
                                    <button type="button" onClick={cancelEdit} className="px-3 py-1 border rounded text-sm flex items-center gap-2">
                                        <X size={14} /> Cancel
                                    </button>
                                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2">
                                        <Save size={14} /> Save
                                    </button>
                                </>
                            ) : (
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
                                    <UploadCloud size={14} /> Upload
                                </button>
                            )}
                        </div>
                    </div>

                    {uploadProgress > 0 && (
                        <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
                                <div style={{ width: `${uploadProgress}%` }} className="h-2 bg-blue-600" />
                            </div>
                            <div className="text-xs text-gray-600 mt-1">{uploadProgress}%</div>
                        </div>
                    )}

                    {error && <div className="mt-3 text-sm text-red-500">{error}</div>}
                </form>

                {/* Policies list with edit/delete */}
                <div className="bg-white p-4 rounded-lg shadow border">
                    <h2 className="text-lg font-medium mb-3">Existing Policies</h2>
                    {loading ? (
                        <div className="text-gray-500">Loading…</div>
                    ) : policies.length === 0 ? (
                        <div className="text-gray-500">No policies yet</div>
                    ) : (
                        <ul className="space-y-3">
                            {policies.map((p) => (
                                <li key={p.id} className="flex items-center justify-between border rounded px-3 py-2">
                                    <div>
                                        <div className="font-medium">{p.name}</div>
                                        <div className="text-xs text-gray-500">{p.fileName?.split("_").pop() || p.fileName}</div>
                                        <div className="text-xs text-gray-500">Covers: {p.covers || "—"}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a href={p.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">Open</a>
                                        <button onClick={() => startEdit(p)} className="px-2 py-1 border rounded text-sm flex items-center gap-1"><Edit size={14} /> Edit</button>
                                        <button onClick={() => handleDelete(p)} className="px-2 py-1 border rounded text-sm text-red-600 flex items-center gap-1"><Trash2 size={14} /> Delete</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
