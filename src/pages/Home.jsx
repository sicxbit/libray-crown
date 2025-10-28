import PolicyList from "../components/PolicyList";
import PolicyUpload from "../components/PolicyUpload"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-8 lg:px-16">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-10 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-10">
          📄 Crown Caregivers — Compliance Policy Library
        </h1>

        <div className="flex justify-center">
          <PolicyList />
        </div>
      </div>

      <footer className="mt-10 text-gray-500 text-sm text-center">
        Crown Caregivers © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
