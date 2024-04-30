import { query } from "@/lib/db";

// Always revalidates data when accessed.
export const revalidate = 0;

// Creates a new company given a company JSON object.
export async function POST(request) {
  // Gets the body of the request which contains a 'company' and 'user' object
  let body = await request.json();

  // The request:
  const users = await query({
    // The SQL query:
    query: `SELECT * FROM users WHERE password = ${JSON.stringify(
      body.user.password
    )}`,
    values: [],
  });

  if (users.length == 0 || users[0].active != 1) return new Response(null);

  // The request:
  const company = await query({
    // The SQL query:
    query: `INSERT INTO companies (name, image, priority, active) 
      VALUES (${JSON.stringify(body.company.name)}, 
      ${JSON.stringify(body.company.image)},
      ${body.company.priority},
      1)`,
    values: [],
  });

  // Returns a JSON representation of the query.
  return new Response(JSON.stringify(company));
}

// Edits an existing company given a company JSON object.
export async function PATCH(request) {
  // Gets the body of the request which contains a 'company' and 'user' object
  let body = await request.json();

  // The request:
  const users = await query({
    // The SQL query:
    query: `SELECT * FROM users WHERE password = ${JSON.stringify(
      body.user.password
    )}`,
    values: [],
  });

  if (users.length == 0 || users[0].active != 1) return new Response(null);

  // The request:
  const company = await query({
    // The SQL query:
    query: `UPDATE companies 
      SET 
        name = ${JSON.stringify(body.company.name)},
        image = ${JSON.stringify(body.company.image)},
        priority = ${JSON.stringify(body.company.priority)}
      WHERE id=${body.company.id}`,
    values: [],
  });

  // Returns a JSON representation of the query.
  return new Response(JSON.stringify(company));
}

// Gets all the data from the companies database.
export async function GET(request) {
  // The request:
  const companies = await query({
    // The SQL query:
    query: `SELECT * FROM companies WHERE active = 1 ORDER BY priority`,
    values: [],
  });

  // Returns a JSON representation of the data.
  return new Response(JSON.stringify(companies));
}

export async function DELETE(request) {
  // Gets the body of the request which contains a 'company' object
  let body = await request.json();

  // The request:
  const users = await query({
    // The SQL query:
    query: `SELECT * FROM users WHERE password = ${JSON.stringify(
      body.user.password
    )}`,
    values: [],
  });

  if (users.length == 0 || users[0].active != 1) return new Response(null);

  // The request:
  const company = await query({
    // The SQL query:
    query: `UPDATE companies
      SET 
        active = 0
      WHERE id=${body.company.id}`,
    values: [],
  });

  // Returns a JSON representation of the data.
  return new Response(JSON.stringify(company));
}
