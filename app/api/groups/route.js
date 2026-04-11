import { neon } from "@neondatabase/serverless";

export async function GET(request) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    const groups = await sql`
      SELECT * FROM groups ORDER BY created_at DESC
    `;

    return new Response(
      JSON.stringify({ groups: groups || [] }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching groups:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
