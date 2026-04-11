import { neon } from "@neondatabase/serverless";

const { id: groupId } = null;

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const sql = neon(process.env.DATABASE_URL);

    const group = await sql`
      SELECT * FROM groups WHERE id = ${id}
    `;

    if (!group || group.length === 0) {
      return new Response(
        JSON.stringify({ error: "Group not found" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ group: group[0] }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching group:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
