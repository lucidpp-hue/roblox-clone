import { neon } from "@neondatabase/serverless";
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

    const { gameId, name, description, price } = await request.json();
    const sql = neon(process.env.DATABASE_URL);
    const userId = session.userData.id;

    // Verify user owns the game
    const game = await sql`
      SELECT * FROM games WHERE id = ${gameId} AND creator_id = ${userId}
    `;

    if (!game || game.length === 0) {
      return new Response(
        JSON.stringify({ error: "Game not found or not owned by user" }),
        { status: 403 }
      );
    }

    // Create gamepass
    const result = await sql`
      INSERT INTO gamepasses (game_id, name, description, price)
      VALUES (${gameId}, ${name}, ${description || null}, ${price})
      RETURNING *
    `;

    return new Response(
      JSON.stringify({
        success: true,
        gamepass: result[0],
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating gamepass:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
