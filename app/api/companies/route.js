import { query } from "@/lib/db";

// Always revalidates data when accessed.
export const revalidate = 0;

// Gets all the data from the companies database.
export async function GET(request) {
  // The request:
  const companies = await query({
    // The SQL query:
    query: `SELECT * FROM companies ORDER BY priority`,
    values: [],
  });

  // Returns a JSON representation of the data.
  return new Response(JSON.stringify(companies));
}
