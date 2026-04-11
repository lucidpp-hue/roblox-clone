import { neon } from "@neondatabase/serverless";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const sql = neon(process.env.DATABASE_URL);

    const members = await sql`
      SELECT u.id, u.username, u.email, gm.role, gm.joined_at
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ${id}
      ORDER BY gm.joined_at ASC
    `;

    return new Response(
      JSON.stringify({ members: members || [] }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching group members:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
