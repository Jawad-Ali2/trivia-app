import axios from "axios";

export function calculateScore(isCorrect: boolean, timeTaken: number) {
  const baseScore = 100;
  const maxBonus = 50;
  const penaltyPerSecond = 10;

  if (!isCorrect) {
    return 0;
  }

  const timeBonus = Math.max(0, maxBonus - timeTaken * penaltyPerSecond);

  return baseScore + timeBonus;
}

export function getShuffledOptions(
  incorrect_answers: string[],
  correct_answer: string,
) {
  const options = [];
  console.log(incorrect_answers);

  incorrect_answers.forEach((incorrectAnswer: string) => {
    options.push(incorrectAnswer);
  });
  options.push(correct_answer);

  const shuffledOptions = options
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  return shuffledOptions;
}

export async function getQuestions(requiredQuestions: number) {
  // TODO: HIT API
  // const data = {
  //   response_code: 0,
  //   results: [
  //     {
  //       type: 'multiple',
  //       difficulty: 'easy',
  //       category: 'Entertainment: Video Games',
  //       question:
  //         'What year did the game &quot;Overwatch&quot; enter closed beta?',
  //       correct_answer: '2015',
  //       incorrect_answers: ['2013', '2011', '2016'],
  //     },
  //     {
  //       type: 'multiple',
  //       difficulty: 'medium',
  //       category: 'History',
  //       question: 'When did construction of the Suez Canal finish?',
  //       correct_answer: '1869',
  //       incorrect_answers: ['1859', '1860', '1850'],
  //     },
  //     {
  //       type: 'multiple',
  //       difficulty: 'medium',
  //       category: 'Geography',
  //       question:
  //         'Which of the following language families is the most controversial amongst modern linguists?',
  //       correct_answer: 'Altaic',
  //       incorrect_answers: ['Sino-Tibetan', 'Dravidian', 'Indo-European'],
  //     },
  //     {
  //       type: 'multiple',
  //       difficulty: 'medium',
  //       category: 'Entertainment: Video Games',
  //       question:
  //         'In &quot;Call Of Duty: Zombies&quot;, completing which map&#039;s main easter egg will reward you with the achievement, &quot;Little Lost Girl&quot;?',
  //       correct_answer: 'Origins',
  //       incorrect_answers: ['Revelations', 'Moon', 'Tranzit'],
  //     },
  //     {
  //       type: 'multiple',
  //       difficulty: 'medium',
  //       category: 'Entertainment: Musicals &amp; Theatres',
  //       question:
  //         'The World Chess Championship in Chess, Act 1 is set in which Italian city?',
  //       correct_answer: 'Merano',
  //       incorrect_answers: ['Venice', 'Milan', 'Rome'],
  //     },
  //   ],
  // };
  const response = await axios.get('https://opentdb.com/api.php?amount=5');

  const data = response.data;

  return data.results;
}
