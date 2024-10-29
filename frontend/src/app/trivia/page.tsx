"use client";
// components/TriviaInterface.tsx

import { useEffect, useLayoutEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { socket } from "../server";
import { useTrivia } from "@/store/TriviaProvider";
import { useAuth } from "@/store/AuthProvider";
import axiosInstance from "@/lib/axios";
import Trivia from "@/components/Trivia";
import { setInterval } from "worker-timers";
import { GameResult, Player, User } from "@/lib/types";
import TriviaQuestion from "@/components/Trivia";
import Statistics from "@/components/Statistics";
import { useToast } from "@/hooks/use-toast";

const TriviaInterface = () => {
  // Dummy data for players in the leaderboard
  const [loadingGame, setLoadingGame] = useState(true); // Whenever the user opens this page they'll see waiting states
  const [timerCountdown, setTimerCountdown] = useState(5);
  const [isAfk, setIsAfk] = useState(false);

  // Question and options (for demonstration purposes)
  const [socketConnection, setSocketConnection] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [closeStatisticsMenu, setCloseStatisticsMenu] = useState(true);
  const { toast } = useToast();
  const authStore = useAuth();
  const { user } = authStore();

  // Selected answer state
  const triviaStore = useTrivia();
  const {
    state,
    setState,
    roomId,
    setRoomId,
    playersCount,
    setPlayersCount,
    trivia,
    setTrivia,
    roomSize,
    setRoomSize,
    roundEnded,
    setRoundEnded,
    leaveRoom,
    triviaResult,
    setTriviaResult,
    resetQuestionTimer,
    setResetQuestionTimer,
    playerAfkCount,
    increasePlayerAfkCount,
  } = triviaStore();

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    // Once the component loads we request to join room

    if (user.userId) {
      const currentUser: Player = {
        ...user,
        status: "playing",
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        position: 0,
        answered: false,
      };

      socket.emit("joinRoom", {
        player: currentUser,
      });
    }

    // Whenever the user loads the page they'll see different states of game loading
    socket.on("roomJoined", ({ roomId, players, roomSize, questionNo }) => {
      console.log("Joined the game");

      setRoomId(roomId);
      setRoomSize(roomSize);

      setTrivia({
        players: players,
        question: "",
        correctAnswer: "0",
        options: [],
        round: 0,
        questionNo: questionNo,
      });
    });

    // ! Waiting For Player (1/4)
    socket.on("playerJoined", ({ players, questionNo }) => {
      console.log(" player Joined the game");

      setPlayersCount(players.length);
      setTrivia({
        players: players,
        question: "",
        correctAnswer: "0",
        options: [],
        round: 0,
        questionNo: questionNo,
      });
    });
    // ! Preparing the room
    // ! Start
    socket.on(
      "startGame",
      ({ roomId, players, question, options, questionNo }) => {
        console.log("START GAME");
        setRoomId(roomId);
        setTrivia({
          players: players,
          question: question.question,
          correctAnswer: question.correct_answer,
          // wrongAnswers: question.incorrect_answers,
          options: options,
          round: 0,
          questionNo: questionNo,
        });
        setState("In Progress");
      }
    );

    socket.on("scoreUpdate", ({ players, room }) => {
      setTrivia({
        ...room,
        players: players,
      });
    }); // Update score

    socket.on(
      "nextQuestion",
      ({ roomId, players, question, options, round, questionNo }) => {
        console.log("Next question");
        setTrivia({
          players: players,
          question: question.question,
          correctAnswer: question.correct_answer,
          options: options,
          round: round,
          questionNo: questionNo,
        });
        setResetQuestionTimer(false);
      }
    );

    socket.on(
      "nextRound",
      ({ roomId, players, question, options, round, questionNo }) => {
        console.log("Next round");
        setTrivia({
          players: players,
          question: question.question,
          correctAnswer: question.correct_answer,
          options: options,
          round: round,
          questionNo: questionNo,
        });
        setRoundEnded(false);
        setResetQuestionTimer(false);
      }
    );

    socket.on(
      "roundFinished",
      ({ roundFinished }: { roundFinished: boolean }) => {
        setRoundEnded(roundFinished);
        setResetQuestionTimer(true);
      }
    );

    socket.on("playerLeft", ({ room, players }) => {
      console.log("player left", room);
      setTrivia({
        ...room,
        players: players,
      });
    });

    socket.on("gameEnded", ({ results }: { results: GameResult }) => {
      console.log("Game has finished");
      setCloseStatisticsMenu(false);
      setTriviaResult(results);
    });

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      if (socket.connected) {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("playerJoined");
        socket.off("roomJoined");
        socket.off("startGame");
        socket.off("scoreUpdate");
        socket.off("nextQuestion");
        socket.off("nextRound");
        socket.off("roundFinished");
        socket.off("playerLeft");
        socket.off("gameEnded");
        onDisconnect();
        leaveRoom(socket, user);
      }
    };
  }, [user]);

  useEffect(() => {
    if (state === "In Progress") {
      setTimerCountdown(5);

      const countDown = setInterval(() => {
        setTimerCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countDown);
            setLoadingGame(false);
            return 0;
          }

          return prev - 1;
        });
      }, 1000);
    }
  }, [state]);

  useEffect(() => {
    if (playerAfkCount === 1) {
      toast({
        title: "AFK Warning",
        description: "If you stay AFK for one more round you'll be kicked.",
      });
    }

    if (playerAfkCount === 2 && socket.connected && user) {
      leaveRoom(socket, user);
      setIsAfk(true);
    }
  }, [playerAfkCount]);

  function onConnect() {
    setSocketConnection(true);

    setTransport(socket.io.engine.transport.name);

    socket.io.engine.on("upgrade", (transport) => {
      setTransport(transport.name);
    });
  }

  function onDisconnect() {
    console.log("Disconenct");
    setSocketConnection(false);
    setTransport("N/A");
    // setRoomId("");
    // setState("Waiting");
    // setPlayersCount(0);
  }

  function closeStatistics() {
    setCloseStatisticsMenu(true);
  }

  function handleReturnFromAFK() {
    setIsAfk(false);
  }
  console.log(isAfk);

  if (isAfk) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
            <p className="text-lg font-semibold">You were detected as AFK.</p>
            <button
              onClick={handleReturnFromAFK}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              I'm Back!
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    // TODO: Separate components in future
    <div className="flex justify-between bg-background p-6 h-screen bg-gradient-to-r from-primary to-secondary">
      {!closeStatisticsMenu && triviaResult && (
        <Statistics gameResult={triviaResult} onClose={closeStatistics} />
      )}

      <div className="absolute flex gap-3 text-white">
        <h2>Status: {socketConnection ? "connected" : "disconnected"}</h2>
        <h3>Transport : {transport}</h3>
      </div>
      {loadingGame ? (
        <div className="m-auto flex flex-col items-center space-y-4 p-6 text-center text-white rounded-lg shadow-lg bg-gradient-to-b from-indigo-500 to-purple-700">
          <h1 className="text-3xl font-bold animate-pulse mb-4">
            {state === "Waiting" ? (
              <div>
                <div className="text-xl mb-2">Waiting for players...</div>
                <div className="text-sm mb-4">
                  Users in queue: {trivia.players.length} / {roomSize}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-green-400 h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${(trivia.players.length / roomSize) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="flex flex-wrap justify-center mt-4 gap-2">
                  {Array.isArray(trivia.players) &&
                    trivia.players.map((player) => (
                      <div
                        key={player.userId}
                        className="p-2 px-3 bg-gray-800 rounded-lg shadow text-sm text-center transition transform hover:scale-105"
                      >
                        {player?.username}
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              state === "In Progress" &&
              timerCountdown > 0 && (
                <>
                  <div className="text-xl">Preparing the room</div>
                  <div className="text-4xl font-bold animate-pulse my-2">
                    {timerCountdown}
                  </div>
                  <div className="flex flex-wrap justify-center mt-4 gap-2">
                    {trivia.players.map((player) => (
                      <div
                        key={player.userId}
                        className="p-2 px-3 bg-gray-800 rounded-lg shadow text-sm text-center transition transform hover:scale-105"
                      >
                        {player.username}
                      </div>
                    ))}
                  </div>
                </>
              )
            )}
          </h1>
        </div>
      ) : (
        <TriviaQuestion
          user={user}
          trivia={trivia}
          roomId={roomId}
          roundFinished={roundEnded}
          resetQuestionTimer={resetQuestionTimer}
          setResetQuestionTimer={setResetQuestionTimer}
          afkCount={playerAfkCount}
          increasePlayerAfkCount={increasePlayerAfkCount}
        />
      )}
    </div>
  );
};

export default TriviaInterface;
