"use client";

import axiosInstance from "@/lib/axios";
import { useEffect } from "react";

export default function Profile() {
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axiosInstance.get("/auth/profile");

        if (response.status === 200) {
          console.log(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
  });

  return <h1 className="text-white">User Profile page</h1>
}
