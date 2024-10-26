

export function calculateScore(isCorrect: boolean, timeTaken: number) {
    const baseScore = 100;
    const maxBonus = 50;
    const penaltyPerSecond = 10;


    if(!isCorrect){
        return 0;
    }

    const timeBonus = Math.max(0, maxBonus - (timeTaken * penaltyPerSecond));

    return baseScore + timeBonus;
}

export function getShuffledOptions(incorrect_answers: string[], correct_answer: string){
    const options = [];
    console.log(incorrect_answers);

    incorrect_answers.forEach((incorrectAnswer : string) => {
        options.push(incorrectAnswer);
      });
      options.push(correct_answer);

      const shuffledOptions = options
      .map(value => ({value, sort: Math.random()}))
      .sort((a,b) => a.sort - b.sort)
      .map(({value}) => value);

      return shuffledOptions;
}