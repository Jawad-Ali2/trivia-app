import React from "react";

function Leaderboard({ trivia }) {

  return (
    <div className="bg-card w-1/4 p-4 rounded-md shadow-lg bg-secondary">
      <h2 className="text-2xl font-black text-foreground mb-4">Leaderboard</h2>
      <ul className="space-y-2">
        {trivia?.players.map((player, index) => (
          <li
            key={player.playerId}
            className="bg-secondary-foreground rounded-md p-2 flex justify-between items-center"
          >
            <span className="text-foreground">{player.username}</span>
            <span className="font-semibold text-foreground">
              {player.score}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Leaderboard;
