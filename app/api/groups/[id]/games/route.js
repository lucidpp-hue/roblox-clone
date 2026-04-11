import { neon } from "@neondatabase/serverless";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const sql = neon(process.env.DATABASE_URL);

    const games = await sql`
      SELECT g.* FROM games g
      JOIN group_games gg ON g.id = gg.game_id
      WHERE gg.group_id = ${id}
      ORDER BY g.created_at DESC
    `;

    return new Response(
      JSON.stringify({ games: games || [] }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching group games:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
