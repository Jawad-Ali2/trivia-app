import { Player, Trivia } from "@/lib/types";
import React from "react";

type LeaderboardProps = {
  trivia: Trivia;
  userId: string;
};

function Leaderboard({ trivia, userId }: LeaderboardProps) {
  return (
    <div className="bg-card w-1/4 p-4 rounded-md shadow-lg bg-secondary">
      <h2 className="text-2xl font-black text-foreground mb-4">Leaderboard</h2>
      <ul className="space-y-2">
        {trivia?.players.map((player: Player, index: number) => (
          <li
            key={player.userId}
            className="bg-secondary-foreground rounded-md p-2 flex justify-between items-center"
          >
            {player.userId === userId ? (
              <span
                className={`text-foreground ${
                  player.status === "left" && "font-light text-gray-500"
                }`}
              >
                You
              </span>
            ) : (
              <span
                className={`text-foreground ${
                  player.status === "left" && "font-light text-gray-500"
                }`}
              >
                {player.username}
              </span>
            )}
            <span className="font-semibold text-foreground">
              {player.score}
            </span>
            {player.answered && <span>✅</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Leaderboard;
