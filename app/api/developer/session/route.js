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

    return new Response(JSON.stringify(devSession[0]), { status: 200 });
  } catch (error) {
    console.error("Error fetching developer session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
