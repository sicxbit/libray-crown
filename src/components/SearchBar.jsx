export default function SearchBar({ onSearch }) {
  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder="Search policies..."
        onChange={(e) => onSearch(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      />
    </div>
  );
}
