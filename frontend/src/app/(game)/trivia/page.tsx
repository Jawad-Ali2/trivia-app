import TriviaInterface from "@/components/TriviaInterface";
import { Suspense } from "react";

const TriviaPage = () => {
  return <Suspense  fallback={<div>Loading...</div>}>
    <TriviaInterface />
  </Suspense>
};


export default TriviaPage;