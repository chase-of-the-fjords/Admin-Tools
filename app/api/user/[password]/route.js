import { query } from "@/lib/db";

// Creates a new machine given a machine JSON object.
export async function GET(request, { params }) {
  let password = params.password;

  // The request:
  const users = await query({
    // The SQL query:
    query: `SELECT * FROM users WHERE password = ${JSON.stringify(password)}`,
    values: [],
  });

  const output = JSON.stringify(users[0]);

  if (output == undefined)
    return new Response(
      JSON.stringify({ id: 0, name: "", password: "", active: 0 })
    );

  // Returns a JSON representation of the data.
  return new Response(output);
}
