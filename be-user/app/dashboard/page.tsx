"use client"; 

import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST", 
        credentials: "include",
      });

      if (res.ok) {

        router.push("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div>
      <h1>Helloworld</h1>
      <button
        onClick={handleLogout}
        className="px-4 py-2 mt-4 bg-red-500 text-white rounded"
      >
        Logout
      </button>
    </div>
  );
}