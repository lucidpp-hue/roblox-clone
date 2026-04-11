import { neon } from "@neondatabase/serverless";
import { calculateGameDayProgression } from "@/app/lib/game-lifecycle";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();

    if (!session || !session.userData) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);
    const userId = session.userData.id;

    // Get or create developer session
    let devSession = await sql`
      SELECT * FROM developer_sessions WHERE user_id = ${userId}
    `;

    if (!devSession || devSession.length === 0) {
      // Create new developer session
      await sql`
        INSERT INTO developer_sessions (user_id, current_day)
        VALUES (${userId}, 1)
      `;
      devSession = await sql`
        SELECT * FROM developer_sessions WHERE user_id = ${userId}
      `;
    }

    devSession = devSession[0];
    const nextDay = devSession.current_day + 1;

    // Get all games for this developer
    const games = await sql`
      SELECT g.* FROM games g
      JOIN users u ON g.creator_id = u.id
      WHERE u.id = ${userId}
    `;

    // Process each game's progression
    const gameProgressions = [];
    for (const game of games) {
      const progression = await calculateGameDayProgression(game.id, devSession);
      gameProgressions.push(progression);
    }

    // Update developer session to next day
    await sql`
      UPDATE developer_sessions
      SET current_day = ${nextDay}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
    `;

    // Increment user visits
    await sql`
      UPDATE users
      SET visits = COALESCE(visits, 0) + 1
      WHERE id = ${userId}
    `;

    return new Response(
      JSON.stringify({
        success: true,
        currentDay: nextDay,
        gameProgressions,
        message: `Advanced to day ${nextDay}`,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error advancing day:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
