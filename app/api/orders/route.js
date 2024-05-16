import { query } from "@/lib/db";

// Always revalidates data when accessed.
export const revalidate = 0;

// Creates a new machine given a machine JSON object.
export async function POST(request) {
  // Gets the body of the request which contains a 'machine' object
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
  const order = await query({
    // The SQL query:
    query: `INSERT INTO orders (name, company, quantity, completed, priority, notes, start, id) 
      VALUES (${JSON.stringify(body.order.name)}, ${JSON.stringify(
      body.order.company
    )}, ${body.order.quantity}, ${body.order.completed}, ${
      body.order.priority
    }, ${JSON.stringify(
      body.order.notes
    )}, CONVERT_TZ(UTC_TIMESTAMP(), "+00:00", "America/Los_Angeles"), ${JSON.stringify(
      body.order.id
    )})`,
    values: [],
  });

  // Returns a JSON representation of the query.
  return new Response(JSON.stringify(order));
}

// Creates a new machine given a machine JSON object.
export async function PATCH(request) {
  // Gets the body of the request which contains a 'machine' object
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
  const order = await query({
    // The SQL query:
    query: `UPDATE orders 
      SET 
        name = ${JSON.stringify(body.order.name)},
        company = ${JSON.stringify(body.order.company)},
        quantity = ${body.order.quantity}, 
        completed = ${body.order.completed}, 
        priority = ${body.order.priority},
        notes = ${JSON.stringify(body.order.notes)},
        id = ${JSON.stringify(body.order.id)},
        end = NULL
      WHERE order_id=${body.order.order_id}`,
    values: [],
  });

  // Returns a JSON representation of the query.
  return new Response(JSON.stringify(order));
}

// Gets all the data from the orders database.
export async function GET(request) {
  // The request:
  const orders = await query({
    // The SQL query:
    query: `SELECT * FROM orders WHERE (end IS NULL OR end > (CONVERT_TZ(UTC_TIMESTAMP(), "+00:00", "America/Los_Angeles") - INTERVAL 2 DAY))`,
    values: [],
  });

  // Returns a JSON representation of the data.
  return new Response(JSON.stringify(orders));
}

export async function DELETE(request) {
  // Gets the body of the request which contains a 'machine' object
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
  const order = await query({
    // The SQL query:
    query: `UPDATE orders
      SET 
        end = CONVERT_TZ(UTC_TIMESTAMP(), "+00:00", "America/Los_Angeles")
      WHERE order_id=${body.order.order_id}`,
    values: [],
  });

  // Returns a JSON representation of the data.
  return new Response(JSON.stringify(order));
}
