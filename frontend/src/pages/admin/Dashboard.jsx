import { PlayCircle as PlayCircleIcon, User as UserIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { useAuth } from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Dashboard = () => {
  const { getToken } = useAuth();

  const [data, setData] = useState({
    entries: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      const abort = new AbortController();
      try {
        const token = await getToken();
        if (!token) throw new Error("No Clerk token returned by getToken()");
        const res = await fetch(`${API_BASE}/api/admin/summary`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abort.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const json = await res.json();
        setData({ entries: json.entries ?? 0, users: json.users ?? 0 });
      } catch (e) {
        console.error("Admin summary fetch failed:", e);
        setError(e.message || "Failed to load admin summary");
      } finally {
        setLoading(false);
      }
      return () => abort.abort();
    };
    run();
  }, [getToken]);

  if (loading) 
    return <Loading />;

  if (error) {
    return (
      <div className="p-6 text-red-400">
        Error: {error}
      </div>
    );
  }

  const dashboardCards = [
    { title: "No. of entries", value: data.entries, icon: PlayCircleIcon },
    { title: "Total Users", value: data.users, icon: UserIcon },
  ];

  return (
    <>
      <Title text1="Admin" text2="Dashboard" />
      <div className="relative flex flex-wrap gap-4 mt-6">
        <BlurCircle top="-100px" left="0" />
        <div className="flex flex-wrap gap-4 w-full">
          {dashboardCards.map((card, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-md max-w-50 w-full"
            >
              <div>
                <h1 className="text-sm">{card.title}</h1>
                <p className="text-xl font-medium mt-1">{card.value}</p>
              </div>
              <card.icon className="w-6 h-6" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
