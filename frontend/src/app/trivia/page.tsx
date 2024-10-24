"use client";
// components/TriviaInterface.tsx

import { useEffect, useLayoutEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { socket } from "../server";
import { useTrivia } from "@/store/TriviaProvider";
import { useAuth } from "@/store/AuthProvider";
import axiosInstance from "@/lib/axios";
// import { useSocket } from "@/store/SocketProvider";

const TriviaInterface = () => {
  // Dummy data for players in the leaderboard
  const [loadingGame, setLoadingGame] = useState(true); // Whenever the user opens this page they'll see waiting states

  // Question and options (for demonstration purposes)
  const [socketConnection, setSocketConnection] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [question, setQuestion] = useState({
    text: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Saturn"],
  });

  // Selected answer state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [playerScore, setPlayerScore] = useState(100); // Player's score
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
  } = triviaStore();

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    // Once the component loads we request to join room
    socket.emit("joinRoom", {
      // TODO: Fix this later
      player: JSON.parse(localStorage.getItem("user") ?? ""),
    });

    // Whenever the user loads the page they'll see different states of game loading
    socket.on("roomJoined", ({ roomId, players, roomSize }) => {
      console.log(" Joined the game");

      const updatedPlayers = players.map((player: any) => ({
        playerId: player.userId,
        username: player.username,
        score: "0",
        correctAnswers: 0,
        wrongAnswers: 0,
        position: "0",
      }));

      // const userDetails = JSON.parse(localStorage.getItem("user") ?? "");
      setRoomId(roomId);
      setRoomSize(roomSize);
      // Add more params here
      setTrivia({
        players: updatedPlayers,
        correctAnswer: "0",
        round: "0",
      });
    });

    // ! Waiting For Player (1/4)
    socket.on("playerJoined", (players) => {
      console.log(" player Joined the game");

      setPlayersCount(players.players.length);
      setTrivia({
        players: players.players,
        correctAnswer: "0",
        round: "0",
      });
    });
    // ! Preparing the room
    // ! Start
    socket.on("startGame", ({ roomId, players, question }) => {
      console.log("START GAME");
      setRoomId(roomId);
      setTrivia({
        players: players,
        correctAnswer: "0",
        round: "0",
      });
      setState("In Progress");
    });

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("playerJoined");
      socket.off("roomJoined");
      // socket.off("joinRoom");
      socket.off("startGame");
      // if (roomId && roomSize > 0) {
      //   // That means the user is currently in queue
      //   socket.emit("leaveRoom", {
      //     roomId,
      //     roomSize,
      //     user: localStorage.getItem("user"),
      //   });
      // }

      onDisconnect();
    };
  }, [socket]);

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

  const handleBeforeUnload = (event: Event) => {
    console.log(roomId);
    console.log("Leaving the page", roomId, roomSize);
    // Emit a custom event to notify the backend
    if (roomId && roomSize > 0) {
      // That means the user is currently in queue
      socket.emit("leaveRoom", {
        roomId,
        roomSize,
        user: localStorage.getItem("user"),
      });
    }

    event.preventDefault();
    // Optional: show a confirmation message
    // event.returnValue = '';  // For most browsers
  };

  // Handle selecting an answer
  const handleAnswerClick = (option: string) => {
    if (!selectedAnswer) {
      setSelectedAnswer(option);
      // Save the answer logic here...
    }
  };

  const handleClickOnButton = () => {
    socket.emit("joinRoom", { playerId: 1 });
  };

  console.log(socket?.connected);

  return (
    // TODO: Separate components in future
    <div className="flex justify-between bg-background p-6 h-screen bg-gradient-to-r from-primary to-secondary">
      <h2>Status: {socketConnection ? "connected" : "disconnected"}</h2>
      <h3>Transport : {transport}</h3>
      <Button onClick={handleClickOnButton}>Click me!</Button>
      {loadingGame ? (
        <h1 className="m-auto text-2xl font-bold text-white">
          {state === "Waiting" ? (
            <div>
              {/* <div>{trivia.players}</div> */}
              <div className="flex text-sm">
                <span>users in queue:</span>
                {Array.isArray(trivia.players) &&
                  trivia.players?.map((player) => (
                    <div key={player.playerId}>
                      <span className="p-1">{player?.username}</span>
                    </div>
                  ))}
              </div>
              <div>Waiting for players {trivia.players.length} / 3</div>
            </div>
          ) : (
            state === "In Progress" && (
              <>
                <div>Preparing the room</div>
                <div>
                  {trivia.players.map((player) => (
                    <>
                      <div key={player.playerId}>{player.username}</div>
                      <br />
                    </>
                  ))}
                </div>
              </>
            )
          )}
        </h1>
      ) : (
        <>
          {/* Trivia Question Section */}
          <div className="w-2/3 p-4 flex flex-col justify-center items-center">
            <div className="bg-card p-8 rounded-md shadow-lg text-center relative w-full">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                {question.text}
              </h3>

              {/* Player's Score on Top Right */}
              <div className="absolute top-4 right-4 bg-secondary p-2 rounded-md">
                <span className="text-foreground">
                  Your Score: {playerScore}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-4">
                {question.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswerClick(option)}
                    className={`p-4 text-lg ${
                      selectedAnswer === option
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    } rounded-md transition duration-300`}
                    disabled={!!selectedAnswer}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            {/* Chat Section Below the Question */}
            <div className="w-full mt-8">
              <div className="bg-secondary-foreground p-4 rounded-md shadow-lg">
                <h2 className="text-xl font-bold text-foreground mb-4">Chat</h2>
                <div className="overflow-y-auto bg-muted p-2 rounded-md h-40">
                  {/* Chat messages */}
                  <p className="text-muted-foreground">Player 1: Hello!</p>
                  <p className="text-muted-foreground">Player 2: Good luck!</p>
                  {/* Add more messages here */}
                </div>
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="w-full bg-input p-2 rounded-md text-foreground"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Section on the Right */}
          <div className="bg-card w-1/4 p-4 rounded-md shadow-lg bg-secondary">
            <h2 className="text-2xl font-black text-foreground mb-4">
              Leaderboard
            </h2>
            <ul className="space-y-2">
              {/* {players.map((player, index) => (
                <li
                  key={index}
                  className="bg-secondary-foreground rounded-md p-2 flex justify-between items-center"
                >
                  <span className="text-foreground">{player.name}</span>
                  <span className="font-semibold text-foreground">
                    {player.score}
                  </span>
                </li>
              ))} */}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default TriviaInterface;
