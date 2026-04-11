import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";

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
    const sql = neon(process.env.DATABASE_URL);
    const userId = session.userData.id;

    // Check if already a member
    const existing = await sql`
      SELECT * FROM group_members WHERE group_id = ${id} AND user_id = ${userId}
    `;

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ error: "Already a member of this group" }),
        { status: 400 }
      );
    }

    // Add as member
    await sql`
      INSERT INTO group_members (group_id, user_id, role)
      VALUES (${id}, ${userId}, 'member')
    `;

    // Increment member count
    await sql`
      UPDATE groups
      SET member_count = member_count + 1
      WHERE id = ${id}
    `;

    return new Response(
      JSON.stringify({ success: true, message: "Joined group" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error joining group:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
