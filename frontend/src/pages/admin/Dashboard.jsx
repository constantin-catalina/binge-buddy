import { PlayCircle as PlayCircleIcon, StarIcon, User as UserIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Loading from '../../components/Loading';
import { dummyShowsData } from '../../lib/dummyShowsData';
import Title from '../../components/admin/Title';
import BlurCircle from '../../components/BlurCircle';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    activeShows: [],
    totalUsers: 0,
  });

  const [loading, setLoading] = useState(true);

  const dashboardCards = [
    { title: 'No. of entries', value: dashboardData.activeShows.length || "0", icon: PlayCircleIcon },
    { title: 'Total Users', value: dashboardData.totalUsers || "0", icon: UserIcon }
  ];

  const fetchDashboardData = async () => {
    const activeShows = dummyShowsData.slice(0, 5);
    const totalUsers = 1287;
    setDashboardData({ activeShows, totalUsers });
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return !loading ? (
    <>
      <Title text1="Admin" text2="Dashboard" />

      <div className="relative flex flex-wrap gap-4 mt-6">
        <BlurCircle top="-100px" left="0" />
        <div className="flex flex-wrap gap-4 w-full">
          {dashboardCards.map((card, index) => (
            <div key={index} className="flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-md max-w-50 w-full">
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
  ) : <Loading />;
};

export default Dashboard;
