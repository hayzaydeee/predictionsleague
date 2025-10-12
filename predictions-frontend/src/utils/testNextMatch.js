/**
 * Test utility to demonstrate next match calculation
 */

import { getNextMatchWithTime } from '../utils/nextMatchUtils.js';

// Sample fixtures data for testing
const sampleFixtures = [
  {
    id: 1,
    homeTeam: "Arsenal",
    awayTeam: "Chelsea", 
    date: "2025-10-13T15:00:00Z", // Tomorrow 3pm
    status: "SCHEDULED",
    venue: "Emirates Stadium",
    gameweek: 8
  },
  {
    id: 2,
    homeTeam: "Manchester City",
    awayTeam: "Liverpool",
    date: "2025-10-13T17:30:00Z", // Tomorrow 5:30pm  
    status: "SCHEDULED",
    venue: "Etihad Stadium",
    gameweek: 8
  },
  {
    id: 3,
    homeTeam: "Tottenham",
    awayTeam: "Manchester United",
    date: "2025-10-11T20:00:00Z", // Yesterday (past match)
    status: "FINISHED",
    venue: "Tottenham Hotspur Stadium", 
    gameweek: 7
  }
];

// Test the next match calculation
console.log('=== Next Match Calculation Test ===');

const nextMatchInfo = getNextMatchWithTime(sampleFixtures);

if (nextMatchInfo) {
  console.log('Next Match Found:');
  console.log('- Match:', `${nextMatchInfo.homeTeam} vs ${nextMatchInfo.awayTeam}`);
  console.log('- Date:', nextMatchInfo.nextMatchTime);
  console.log('- Time Display:', nextMatchInfo.timeDisplay);
  console.log('- Venue:', nextMatchInfo.venue);
  console.log('- Gameweek:', nextMatchInfo.gameweek);
} else {
  console.log('No upcoming matches found');
}

export { sampleFixtures, nextMatchInfo };