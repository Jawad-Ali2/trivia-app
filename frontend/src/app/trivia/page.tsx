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
import { Player, User } from "@/lib/types";
import TriviaQuestion from "@/components/Trivia";

const TriviaInterface = () => {
  // Dummy data for players in the leaderboard
  const [loadingGame, setLoadingGame] = useState(true); // Whenever the user opens this page they'll see waiting states
  const [timerCountdown, setTimerCountdown] = useState(5);

  // Question and options (for demonstration purposes)
  const [socketConnection, setSocketConnection] = useState(false);
  const [transport, setTransport] = useState("N/A");
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
    socket.on("roomJoined", ({ roomId, players, roomSize }) => {
      console.log("Joined the game");

      setRoomId(roomId);
      setRoomSize(roomSize);

      setTrivia({
        players: players,
        question: "",
        correctAnswer: "0",
        options: [],
        round: 0,
      });
    });

    // ! Waiting For Player (1/4)
    socket.on("playerJoined", (players) => {
      console.log(" player Joined the game");

      setPlayersCount(players.players.length);
      setTrivia({
        players: players.players,
        question: "",
        correctAnswer: "0",
        options: [],
        round: 0,
      });
    });
    // ! Preparing the room
    // ! Start
    socket.on("startGame", ({ roomId, players, question, options }) => {
      console.log("START GAME");
      setRoomId(roomId);
      setTrivia({
        players: players,
        question: question.question,
        correctAnswer: question.correct_answer,
        // wrongAnswers: question.incorrect_answers,
        options: options,
        round: 0,
      });
      setState("In Progress");
    });

    socket.on("scoreUpdate", ({ players, room }) => {
      setTrivia({
        ...room,
        players: players,
      });
    }); // Update score

    socket.on("nextRound", ({ roomId, players, question, options, round }) => {
      console.log("Next round");
      setTrivia({
        players: players,
        question: question.question,
        correctAnswer: question.correct_answer,
        // wrongAnswers: question.incorrect_answers,
        options: options,
        round: round,
      });
      setRoundEnded(false);
    });

    socket.on(
      "roundFinished",
      ({ roundFinished }: { roundFinished: boolean }) => {
        setRoundEnded(roundFinished);
      }
    );

    socket.on("playerLeft", ({ room, players }) => {
      console.log("player left", room);
      setTrivia({
        ...room,
        players: players,
      });
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
        socket.off("nextRound");
        socket.off("roundFinished");
        socket.off("playerLeft");
        onDisconnect();
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
    return () => {
      // if (socket.connected) {
      //   if (user && roomId) {
      //     const currentTrivia = trivia;
      //     console.log("TRYING TO DC", currentTrivia);
      //     socket.emit("leaveRoom", { roomId, player: user, trivia: currentTrivia });
      //   }
      // }
      leaveRoom(socket, user);
    };
  }, [user, roomId]);

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
  }

  return (
    // TODO: Separate components in future
    <div className="flex justify-between bg-background p-6 h-screen bg-gradient-to-r from-primary to-secondary">
      <div className="absolute flex gap-3 text-white">
        <h2>Status: {socketConnection ? "connected" : "disconnected"}</h2>
        <h3>Transport : {transport}</h3>
      </div>
      {loadingGame ? (
        <h1 className="m-auto text-2xl font-bold text-white">
          {state === "Waiting" ? (
            <div>
              {/* <div>{trivia.players}</div> */}
              <div className="flex text-sm">
                <span>users in queue:</span>
                {Array.isArray(trivia.players) &&
                  trivia.players?.map((player) => (
                    <div key={player.userId}>
                      <span className="p-1">{player?.username}</span>
                    </div>
                  ))}
              </div>
              <div>
                Waiting for players {trivia.players.length} / {roomSize}
              </div>
            </div>
          ) : (
            state === "In Progress" &&
            timerCountdown > 0 && (
              <>
                <div>Preparing the room</div>
                <div>{timerCountdown}</div>
                <div>
                  {trivia.players.map((player) => (
                    <div key={player.userId} className="text-sm">
                      {player.username}
                    </div>
                  ))}
                </div>
              </>
            )
          )}
        </h1>
      ) : (
        <TriviaQuestion
          user={user}
          trivia={trivia}
          roomId={roomId}
          roundFinished={roundEnded}
        />
      )}
    </div>
  );
};

export default TriviaInterface;
