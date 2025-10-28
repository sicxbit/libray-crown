import React, { useState, useEffect } from "react";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { FileText, Download } from "lucide-react";

export default function PolicyList() {
  const [policies, setPolicies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const policiesRef = ref(storage, "policies");
        const res = await listAll(policiesRef);

        const urls = await Promise.all(
          res.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            return { name: itemRef.name, url };
          })
        );

        setPolicies(urls);
        setFiltered(urls);
      } catch (error) {
        console.error("Error fetching policies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  useEffect(() => {
    setFiltered(
      policies.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, policies]);

  const cleanName = (name) =>
    name
      .replace(/\.[^/.]+$/, "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-6 w-full">
      <div className="w-full max-w-6xl bg-white shadow-lg border border-gray-300 rounded-lg p-6">
        {/* Search */}
        <div className="flex justify-end mb-6">
          <input
            type="text"
            placeholder="Search policies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none transition"
          />
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-gray-500 text-center py-10 animate-pulse">
            Loading policies...
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            No matching policies found.
          </p>
        ) : (
          <div className="overflow-x-auto bg-gray-50 border border-gray-300 rounded-lg">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 border-b border-gray-300">
                  <th className="p-3 text-left font-semibold text-gray-700 border-r border-gray-300">
                    Document Name
                  </th>
                  <th className="p-3 text-center font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((policy, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-300 hover:bg-gray-100 transition"
                  >
                    <td className="p-3 border-r border-gray-200 align-middle">
                      <div className="flex items-center gap-3">
                        <FileText className="text-blue-600" size={20} />
                        <div>
                          <div className="font-medium text-gray-800">
                            {cleanName(policy.name)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {policy.name.split(".").pop().toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <a
                        href={policy.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <Download size={16} />
                        View / Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
