"use client";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";

const CustomRoomForm = () => {
  const router = useRouter();
  const [numRounds, setNumRounds] = useState<string>("2");
  const [numQuestions, setNumQuestions] = useState<string>("5");
  const [totalPlayers, setTotalPlayer] = useState<string>("2");
  const [category, setCategory] = useState<string>("Any Category");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(parseInt(numRounds, 10), parseInt(numQuestions, 10));

    router.push(
      `/trivia?rounds=${numRounds}&questions=${numQuestions}&players=${totalPlayers}&roomType=private`
    );
  };

  return (
    <div className="max-w-sm m-10 bg-white p-6 rounded-lg shadow-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">Game Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="numRounds" className="block text-gray-700">
            Number of Rounds
          </label>
          <input
            type="number"
            id="numRounds"
            className="w-full p-2 border rounded mt-1"
            value={numRounds}
            onChange={(e) => setNumRounds(e.target.value)}
            min="2"
            max="10"
            required
          />
        </div>

        <div>
          <label htmlFor="numQuestions" className="block text-gray-700">
            Number of Questions in Each Round
          </label>
          <input
            type="number"
            id="numQuestions"
            className="w-full p-2 border rounded mt-1"
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
            min="5"
            max="10"
            required
          />
        </div>

        <div>
          <label htmlFor="numQuestions" className="block text-gray-700">
            Total Players
          </label>
          <input
            type="number"
            id="numQuestions"
            className="w-full p-2 border rounded mt-1"
            value={totalPlayers}
            onChange={(e) => setTotalPlayer(e.target.value)}
            min="2"
            max="10"
            required
          />
        </div>
        <div>
          <div className="flex gap-3 items-center">

          <label htmlFor="category" className="block text-gray-700">
            Enter Specific Category
          </label>
          <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
            Coming Soon!
          </span>
          </div>
          <Input
            type="text"
            id="category"
            className="w-full p-2 border rounded mt-1"
            disabled={true}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            min="1"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600"
        >
          Start Game
        </button>
      </form>
    </div>
  );
};

export default CustomRoomForm;
