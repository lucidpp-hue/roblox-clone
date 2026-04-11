import { neon } from "@neondatabase/serverless";

/**
 * Game lifecycle logic for handling:
 * - Player count decay (gradual 10-15% + random drops 5-30%)
 * - Peak player tracking
 * - Recovery boosts (followers, group, title update, revival)
 * - Game status transitions
 */

export async function calculateGameDayProgression(gameId, developerSession) {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // Get current game state
    const game = await sql`
      SELECT * FROM games WHERE id = ${gameId}
    `;

    if (!game || game.length === 0) {
      throw new Error(`Game ${gameId} not found`);
    }

    const gameData = game[0];
    let currentPlayers = gameData.current_players || 0;
    const peakPlayers = gameData.peak_players || currentPlayers;
    const daysSinceCreation = developerSession.current_day - gameData.created_day;

    // Calculate player decay and drops
    let decayFactor = 0.85 + Math.random() * 0.05; // 85-90% retention
    let newPlayerCount = Math.floor(currentPlayers * decayFactor);

    // Random significant drops (5-30% chance of 5-30% drop)
    if (Math.random() < 0.15) {
      const dropPercentage = 0.05 + Math.random() * 0.25;
      newPlayerCount = Math.floor(newPlayerCount * (1 - dropPercentage));
    }

    // Recovery boosts
    let recoveryBoost = 0;

    // 1. Title update boost (25-30% increase if recently updated)
    if (gameData.last_title_update) {
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(gameData.last_title_update).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysSinceUpdate <= 1) {
        recoveryBoost += 0.25 + Math.random() * 0.05;
      }
    }

    // 2. Followers boost (5-10% if follower count > 10)
    const developer = await sql`SELECT * FROM users WHERE id = ${developerSession.user_id}`;
    if (developer && developer[0]) {
      const followerCount = developer[0].followers || 0;
      if (followerCount > 10 && !gameData.followers_boost_applied) {
        recoveryBoost += 0.05 + (followerCount / 200) * 0.05;
        // Mark boost as applied
        await sql`
          UPDATE games 
          SET followers_boost_applied = true 
          WHERE id = ${gameId}
        `;
      }
    }

    // 3. Group boost (minimum 10% of peak if in a group)
    if (gameData.group_id) {
      const minPlayers = Math.floor(peakPlayers * 0.1);
      newPlayerCount = Math.max(newPlayerCount, minPlayers);
    }

    // Apply recovery boost
    newPlayerCount = Math.floor(newPlayerCount * (1 + recoveryBoost));

    // Cap at peak players
    newPlayerCount = Math.min(newPlayerCount, peakPlayers);

    // Update peak players if current exceeds it
    const newPeak = Math.max(peakPlayers, newPlayerCount);

    // Record game stats for this day
    await sql`
      INSERT INTO game_stats (game_id, day, player_count, active)
      VALUES (${gameId}, ${developerSession.current_day}, ${newPlayerCount}, ${
        newPlayerCount > 0
      })
      ON CONFLICT (game_id, day) DO UPDATE SET 
        player_count = ${newPlayerCount},
        active = ${newPlayerCount > 0}
    `;

    // Update game with new player count
    await sql`
      UPDATE games 
      SET current_players = ${newPlayerCount}, peak_players = ${newPeak}
      WHERE id = ${gameId}
    `;

    return {
      gameId,
      previousPlayers: currentPlayers,
      newPlayers: newPlayerCount,
      peakPlayers: newPeak,
      recovered: recoveryBoost > 0,
    };
  } catch (error) {
    console.error(`Error calculating game progression for game ${gameId}:`, error);
    throw error;
  }
}

export async function applyTitleUpdateBoost(gameId) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    await sql`
      UPDATE games 
      SET last_title_update = CURRENT_TIMESTAMP
      WHERE id = ${gameId}
    `;
    return { success: true, message: "Title update boost applied" };
  } catch (error) {
    console.error(`Error applying title update boost for game ${gameId}:`, error);
    throw error;
  }
}

export async function applyGameRevival(gameId) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    // Check if revival is available
    const used = await sql`
      SELECT * FROM game_revival_used WHERE game_id = ${gameId}
    `;

    if (used && used.length > 0) {
      throw new Error("Revival already used for this game");
    }

    // Mark revival as used
    await sql`
      INSERT INTO game_revival_used (game_id)
      VALUES (${gameId})
    `;

    // Apply 50% boost to current players
    const game = await sql`SELECT * FROM games WHERE id = ${gameId}`;
    if (game && game[0]) {
      const boostedPlayers = Math.floor(game[0].current_players * 1.5);
      await sql`
        UPDATE games 
        SET current_players = ${boostedPlayers}, peak_players = GREATEST(peak_players, ${boostedPlayers})
        WHERE id = ${gameId}
      `;
    }

    return { success: true, message: "Game revival applied successfully" };
  } catch (error) {
    console.error(`Error applying game revival for game ${gameId}:`, error);
    throw error;
  }
}

export async function addGameToGroup(gameId, groupId) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    await sql`
      INSERT INTO group_games (group_id, game_id)
      VALUES (${groupId}, ${gameId})
      ON CONFLICT (group_id, game_id) DO NOTHING
    `;

    // Update game group_id
    await sql`
      UPDATE games 
      SET group_id = ${groupId}
      WHERE id = ${gameId}
    `;

    return { success: true, message: "Game added to group" };
  } catch (error) {
    console.error(`Error adding game to group:`, error);
    throw error;
  }
}
