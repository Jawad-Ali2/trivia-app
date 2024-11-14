"use client";

import axiosInstance from "@/lib/axios";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Profile() {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    highestScore: 0, // Placeholder for future use
    roundsPlayed: 0, // Placeholder for future use
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axiosInstance.get("/auth/profile");

        if (response.status === 200) {
          setUserData({
            username: response.data.username,
            email: response.data.email,
            highestScore: userData.highestScore, // Keep initial state, will update later
            roundsPlayed: userData.roundsPlayed, // Keep initial state, will update later
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center bg-gradient-to-r from-primary to-secondary min-h-screen">
      <div className="relative text-white bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 rounded-lg shadow-lg min-w-[80%] mx-3 m-12">
        <h1 className="text-2xl font-bold mb-4">User Profile</h1>
        <div className="mb-4">
          <label className="font-semibold">Username:</label>
          <p className="text-gray-300">{userData.username || "Not available"}</p>
        </div>
        <div className="mb-4">
          <label className="font-semibold">Email:</label>
          <p className="text-gray-300">{userData.email || "Not available"}</p>
        </div>
        <div className="mb-4">
          <label className="font-semibold">Highest Score:</label>
          <p className="text-gray-300">{userData.highestScore}</p>
        </div>
        <div className="mb-4">
          <label className="font-semibold">Rounds Played:</label>
          <p className="text-gray-300">{userData.roundsPlayed}</p>
        </div>
        <Image
          src="/dogge.png"
          alt="Cute Cartoon"
          className="absolute bottom-0 right-0"
          height={32}
          width={32}
        />
      </div>
    </div>
  );
}