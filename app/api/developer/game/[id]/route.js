import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const sql = neon(process.env.DATABASE_URL);

    const game = await sql`
      SELECT * FROM games WHERE id = ${id}
    `;

    if (!game || game.length === 0) {
      return new Response(
        JSON.stringify({ error: "Game not found" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ game: game[0] }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching game:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
