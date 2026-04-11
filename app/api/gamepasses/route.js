import { neon } from "@neondatabase/serverless";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");

    if (!gameId) {
      return new Response(
        JSON.stringify({ error: "gameId is required" }),
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    const gamepasses = await sql`
      SELECT * FROM gamepasses WHERE game_id = ${gameId}
      ORDER BY created_at DESC
    `;

    return new Response(
      JSON.stringify({ gamepasses: gamepasses || [] }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching gamepasses:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
