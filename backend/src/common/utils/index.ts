

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