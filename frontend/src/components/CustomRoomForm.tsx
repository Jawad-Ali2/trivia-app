"use client";
import React, { useState } from "react";
import { Input } from "./ui/input";

type GameSettings = {
  numRounds: number;
  numQuestions: number;
};

type CustomRoomFormProps = {
  onSubmit: (settings: GameSettings) => void;
};

const CustomRoomForm: React.FC<CustomRoomFormProps> = ({ onSubmit }) => {
  const [numRounds, setNumRounds] = useState<string>("2");
  const [numQuestions, setNumQuestions] = useState<string>("5");
  const [category, setCategory] = useState<string>("Any Category");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      numRounds: parseInt(numRounds, 10),
      numQuestions: parseInt(numQuestions, 10),
    });
  };

  return (
    <div className="max-w-sm mx-auto bg-white p-6 rounded-lg shadow-md">
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
            required
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-gray-700">
            Number of Questions in Each Round
          </label>
          <Input
            type="text"
            id="category"
            className="w-full p-2 border rounded mt-1"
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
