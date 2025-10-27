import { useEffect, useState } from "react";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { FileText } from "lucide-react";

export default function Home() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
          📄 Crown Caregivers — Compliance Policy Library
        </h1>

        {/* Search Bar */}
        <div className="flex justify-center mb-6">
          <input
            type="text"
            placeholder="Search policies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none transition"
          />
        </div>

        {/* Table Layout */}
        {loading ? (
          <p className="text-gray-500 text-center animate-pulse">
            Loading policies...
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500 text-center">No matching policies found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse flex justify-center">
              <thead>
                <tr className="bg-blue-100 text-gray-700 text-left">
                  <th className="p-3 font-semibold">Document</th>
                  <th className="p-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((policy, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="p-3 flex items-center space-x-3">
                      <FileText className="text-blue-600" />
                      <span className="font-medium text-gray-800 break-words">
                        {policy.name}
                      </span>
                    </td>
                    <td className="p-3">
                      <a
                        href={policy.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-semibold hover:underline"
                      >
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

      {/* Footer */}
      <footer className="mt-8 text-gray-500 text-sm">
        Crown Caregivers © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
