import React from "react";

const Statistics = ({ gameResult, onClose }) => {
  const { winningPlayer, playersPerformance, totalRounds, endTime } =
    gameResult;

  const sortedPlayers = [...playersPerformance].sort(
    (a, b) => b.totalScore - a.totalScore
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-gray-900 text-white w-11/12 max-w-2xl p-8 rounded-lg shadow-lg">
        <h2 className="text-4xl font-bold text-center mb-6 animate-pulse">
          Game Over
        </h2>

        <div className="text-center text-xl mb-4">
          Winner:{" "}
          <span className="font-bold text-yellow-400">
            {winningPlayer.username}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            Total Rounds: <span className="font-semibold">{totalRounds}</span>
          </div>
          <div>
            End Time:{" "}
            <span className="font-semibold">
              {new Date(endTime).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-semibold text-center mb-2">
            Player Stats
          </h3>
          <div className="max-h-64 overflow-y-auto">
            {sortedPlayers.map((player, idx) => (
              <div
                key={player.userId}
                className="flex items-center justify-between p-2 border-b border-gray-700"
              >
                <span
                  className={`text-lg ${
                    player.userId === winningPlayer.userId
                      ? "text-yellow-400"
                      : ""
                  }`}
                >
                  {idx + 1}. {player.username}
                </span>
                <span className="text-sm">Score: {player.totalScore}</span>
                <span className="text-sm">
                  Correct: {player.correctAnswers}
                </span>
                <span className="text-sm">
                  Avg. Time: {player.averageTimePerRound.toFixed(2)}s
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="block w-full py-2 mt-6 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Statistics;
