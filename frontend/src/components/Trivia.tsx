"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { useTrivia } from "@/store/TriviaProvider";
import Leaderboard from "./Leaderboard";
import { socket } from "@/app/server";
import { ScoreUpdateDTO, Trivia, User } from "@/lib/types";
import { setInterval, clearInterval } from "worker-timers";
import GameOverlay from "./GameOverlay";

type TriviaProps= {
  user: User;
  trivia: Trivia;
  roomId: string;
  // setRoundFinished: () => void;
  roundFinished: boolean;
  resetQuestionTimer: boolean;
  setResetQuestionTimer: (value: boolean) => void;
  afkCount: number;
  increasePlayerAfkCount: () => void;
}

function TriviaQuestion({
  user,
  trivia,
  roomId,
  roundFinished,
  resetQuestionTimer,
  setResetQuestionTimer,
  afkCount,
  increasePlayerAfkCount
}: TriviaProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [playerScore, setPlayerScore] = useState(0); // Player's score
  const [timer, setTimer] = useState(5);
  const [showOverlay, setShowOverlay] = useState(true);
  const answerTimer = useRef<number | null>(null);

  useEffect(() => {
    // Check to start the timer
    if (!answerTimer.current && !resetQuestionTimer && !roundFinished && !showOverlay) {
      console.log("Starting timer");
      setTimer(5); // Reset timer to initial value
      answerTimer.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(answerTimer.current!);
            answerTimer.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Check to reset or stop the timer
    if (resetQuestionTimer || roundFinished) {
      console.log("Stopping and resetting timer");
      if (answerTimer.current !== null) {
        clearInterval(answerTimer.current);
        answerTimer.current = null;
      }
      if (roundFinished) setShowOverlay(true); // Show overlay if round is finished
    }

    // Cleanup function to stop the timer if the component unmounts
    return () => {
      if (answerTimer.current !== null) {
        clearInterval(answerTimer.current);
        answerTimer.current = null;
      }
    };
  }, [resetQuestionTimer, roundFinished, showOverlay]);

  useEffect(() => {
    if (selectedAnswer) setSelectedAnswer(null);
  }, [trivia.questionNo]);

  useEffect(() => {
    if(timer === 0 && !selectedAnswer){
      handleAnswerClick("");
      increasePlayerAfkCount();
    }
  }, [timer])

  // Handle selecting an answer
  const handleAnswerClick = (option: string) => {
    if (!selectedAnswer) {
      setSelectedAnswer(option);
      // Save the answer logic here...
      const isCorrect = trivia.correctAnswer === option;

      const answerSubmitDTO: ScoreUpdateDTO = {
        userId: user.userId,
        trivia,
        roomId: roomId,
        optionSelected: option,
        isCorrect,
        timeTaken: timer,
        totalTime: 60,
        questionIndex: trivia.questionNo,
      };

      setResetQuestionTimer(true);
      socket.emit("submitAnswer", answerSubmitDTO);
    }
  };

  return (
    <>
      {/* Trivia Question Section */}
      {showOverlay && (
        <GameOverlay
          roundNo={trivia.round + 1}
          onComplete={() => setShowOverlay(false)}
        />
      )}
      {!showOverlay && (
        <div className="w-2/3 p-4 flex flex-col justify-center items-center">
          <div className="flex gap-3">
            <div className="text-xl mt-10">Time Remaining: {timer}</div>
            <div className="text-xl mt-10">Round# {trivia.round + 1}</div>
            <div className="text-xl mt-10">
              Question# {trivia.questionNo + 1}
            </div>
          </div>
          <div className="bg-card p-8 rounded-md shadow-lg text-center relative w-full">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              {trivia.question}
            </h3>

            {/* Player's Score on Top Right */}
            <div className="absolute top-4 right-4 bg-secondary p-2 rounded-md">
              <span className="text-foreground">Your Score: {playerScore}</span>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-4">
              {trivia.options.map((option, index) => (
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
      )}
      <Leaderboard trivia={trivia} userId={user.userId} />
      {/* Leaderboard Section on the Right */}
    </>
  );
}

export default TriviaQuestion;
