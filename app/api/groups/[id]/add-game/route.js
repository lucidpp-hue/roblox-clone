import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";
import { addGameToGroup } from "@/app/lib/game-lifecycle";

export async function POST(request, { params }) {
  try {
    const session = await auth();

    if (!session || !session.userData) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      );
    }

    const { id } = await params;
    const { gameId } = await request.json();
    const sql = neon(process.env.DATABASE_URL);
    const userId = session.userData.id;

    // Verify user is group owner
    const group = await sql`
      SELECT * FROM groups WHERE id = ${id} AND creator_id = ${userId}
    `;

    if (!group || group.length === 0) {
      return new Response(
        JSON.stringify({ error: "You do not own this group" }),
        { status: 403 }
      );
    }

    // Verify user owns the game
    const game = await sql`
      SELECT * FROM games WHERE id = ${gameId} AND creator_id = ${userId}
    `;

    if (!game || game.length === 0) {
      return new Response(
        JSON.stringify({ error: "Game not found or not owned by you" }),
        { status: 403 }
      );
    }

    // Add game to group
    const result = await addGameToGroup(gameId, id);

    return new Response(
      JSON.stringify({ success: true, message: "Game added to group" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding game to group:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
