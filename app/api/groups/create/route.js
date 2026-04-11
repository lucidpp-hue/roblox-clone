import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();

    if (!session || !session.userData) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      );
    }

    const { name, description } = await request.json();

    if (!name || name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Group name is required" }),
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);
    const userId = session.userData.id;

    // Create group
    const result = await sql`
      INSERT INTO groups (creator_id, name, description, member_count)
      VALUES (${userId}, ${name}, ${description || null}, 1)
      RETURNING id
    `;

    // Add creator as owner
    await sql`
      INSERT INTO group_members (group_id, user_id, role)
      VALUES (${result[0].id}, ${userId}, 'owner')
    `;

    return new Response(
      JSON.stringify({
        success: true,
        groupId: result[0].id,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating group:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
