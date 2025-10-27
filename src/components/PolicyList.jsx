export default function PolicyList({ policies }) {
  if (!policies.length)
    return <p className="text-gray-500 text-center">No policies found.</p>;

  return (
    <div className="space-y-4">
      {policies.map((policy) => (
        <div
          key={policy.id}
          className="p-4 bg-gray-50 border border-gray-200 rounded-xl hover:shadow-md transition"
        >
          <h2 className="font-semibold text-lg text-gray-800">{policy.title}</h2>
          <p className="text-sm text-gray-600 mb-2">{policy.description}</p>
          {policy.url && (
            <a
              href={policy.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Document →
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
