import PolicyList from "../components/PolicyList";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-8 lg:px-16">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-10 border border-gray-200">
        <img
          src='/CrownUpdated.png'
          alt="Crown logo"
          className="w-96 h-50 object-contain mx-auto block mb-6"
        />
        <h1 className="text-3xl font-bold text-gray-600 text-center ">
            Compliance Policy Library
        </h1>

        <div className="flex justify-center min-w-full">
          <PolicyList />
        </div>
      </div>

      <footer className="mt-10 text-gray-500 text-sm text-center">
        Crown Caregivers © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
