import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";
import { applyGameRevival } from "@/app/lib/game-lifecycle";

export async function POST(request) {
  try {
    const session = await auth();

    if (!session || !session.userData) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      );
    }

    const { gameId } = await request.json();
    const sql = neon(process.env.DATABASE_URL);
    const userId = session.userData.id;

    // Verify user owns this game
    const game = await sql`
      SELECT * FROM games WHERE id = ${gameId} AND creator_id = ${userId}
    `;

    if (!game || game.length === 0) {
      return new Response(
        JSON.stringify({ error: "Game not found or not owned by user" }),
        { status: 403 }
      );
    }

    // Apply game revival
    const result = await applyGameRevival(gameId);

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error("Error applying game revival:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
