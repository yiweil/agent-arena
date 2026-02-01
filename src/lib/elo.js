const K = 32;

export function calculateElo(winnerRating, loserRating) {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser = 1 - expectedWinner;
  const change = Math.round(K * (1 - expectedWinner));
  return {
    winnerNew: winnerRating + change,
    loserNew: loserRating - change,
    change,
  };
}

export function calculateEloChange(rating1, rating2, player1Wins) {
  if (player1Wins) {
    return calculateElo(rating1, rating2).change;
  } else {
    return calculateElo(rating2, rating1).change;
  }
}
