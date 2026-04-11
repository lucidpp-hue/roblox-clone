import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";

export async function GET(request) {
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

    // Get all games created by this user
    const games = await sql`
      SELECT * FROM games WHERE creator_id = ${userId} ORDER BY created_at DESC
    `;

    return new Response(
      JSON.stringify({ games: games || [] }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching developer games:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
