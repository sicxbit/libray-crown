import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function PolicyList({ isAdmin = false }) {
  const [policies, setPolicies] = useState([]);
  const [filteredPolicies, setFilteredPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [editedData, setEditedData] = useState({ name: "", attribute: "" });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const policiesPerPage = 10;

  // 🔹 Fetch policies from Firestore
  useEffect(() => {
    async function fetchPolicies() {
      try {
        const q = query(collection(db, "test"), orderBy("uploadedAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPolicies(data);
        setFilteredPolicies(data);
      } catch (err) {
        console.error("❌ Failed to fetch policies:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPolicies();
  }, []);

  // 🔍 Filter policies based on search term
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = policies.filter(
      (p) =>
        p.name?.toLowerCase().includes(term) ||
        p.attribute?.toLowerCase().includes(term)
    );
    setFilteredPolicies(filtered);
    setCurrentPage(1); // reset to first page on search
  }, [searchTerm, policies]);

  // 🗑️ Delete policy (Admin only)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this policy?")) return;
    try {
      await deleteDoc(doc(db, "test", id));
      setPolicies((prev) => prev.filter((p) => p.id !== id));
      setFilteredPolicies((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("❌ Error deleting policy:", err);
    }
  };

  // ✏️ Edit Popup Handling
  const handleEdit = (policy) => {
    setEditingPolicy(policy);
    setEditedData({ name: policy.name, attribute: policy.attribute });
  };

  // 💾 Save edit to Firestore
  const handleSaveEdit = async () => {
    try {
      const policyRef = doc(db, "test", editingPolicy.id);
      await updateDoc(policyRef, {
        name: editedData.name,
        attribute: editedData.attribute,
      });

      // Update locally
      setPolicies((prev) =>
        prev.map((p) =>
          p.id === editingPolicy.id ? { ...p, ...editedData } : p
        )
      );
      setFilteredPolicies((prev) =>
        prev.map((p) =>
          p.id === editingPolicy.id ? { ...p, ...editedData } : p
        )
      );

      setEditingPolicy(null);
    } catch (err) {
      console.error("❌ Error updating policy:", err);
    }
  };

  // 🧮 Pagination logic
  const totalPages = Math.ceil(filteredPolicies.length / policiesPerPage);
  const startIndex = (currentPage - 1) * policiesPerPage;
  const currentPolicies = filteredPolicies.slice(
    startIndex,
    startIndex + policiesPerPage
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-600 animate-pulse">
        Loading policies...
      </p>
    );

  return (
    <div className="min-w-full mx-auto bg-white p-6 rounded-lg shadow-md mt-10">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {isAdmin ? "Manage Policies" : "Uploaded Policies"}
      </h2>

      {/* 🔍 Search Bar */}
      <input
        type="text"
        placeholder="Search by name or attribute..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:ring focus:ring-blue-200"
      />

      {currentPolicies.length === 0 ? (
        <p className="text-gray-500">No policies found.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {currentPolicies.map((policy) => (
            <li
              key={policy.id}
              className="py-3 flex justify-between items-center hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-medium text-gray-900">{policy.name}</p>
                <p className="text-sm text-gray-500">{policy.attribute}</p>
              </div>

              <div className="flex gap-3 items-center">
                <a
                  href={policy.fileURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  View
                </a>

                {isAdmin && (
                  <>
                    <button
                      onClick={() => handleEdit(policy)}
                      className="text-yellow-600 hover:text-yellow-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(policy.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 🔄 Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md border ${
              currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white hover:bg-gray-100 text-blue-600 border-blue-300"
            }`}
          >
            Previous
          </button>

          <span className="text-gray-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md border ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white hover:bg-gray-100 text-blue-600 border-blue-300"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* 🪟 Edit Popup */}
      {editingPolicy && isAdmin && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Edit Policy
            </h3>

            <label className="block mb-2 text-sm font-medium text-gray-700">
              Name:
            </label>
            <input
              type="text"
              value={editedData.name}
              onChange={(e) =>
                setEditedData({ ...editedData, name: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md mb-3"
            />

            <label className="block mb-2 text-sm font-medium text-gray-700">
              Attribute:
            </label>
            <input
              type="text"
              value={editedData.attribute}
              onChange={(e) =>
                setEditedData({ ...editedData, attribute: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingPolicy(null)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
