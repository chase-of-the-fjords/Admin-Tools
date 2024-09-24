import { query } from "@/lib/db";

// Always revalidates data when accessed.
export const revalidate = 0;

String.prototype.escapeSpecialChars = function() {
  return this.replaceAll("\n", "\\n")
             .replaceAll("\r", "\\r");
};

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

  // Adds an entry to the log:

  const logEntry = {
    action: "create",
    user: users[0].id,
    timestamp: (new Date()).toLocaleString('lt-LT', {timeZone: "America/Los_Angeles"}),
    values: {
      name: body.order.name,
      company: body.order.company,
      category: body.order.category,
      quantity: body.order.quantity,
      completed: body.order.completed,
      priority: body.order.priority,
      notes: body.order.notes,
      id: body.order.id
    }
  }

  const log = [ logEntry ];

  // The request:
  const order = await query({
    // The SQL query:
    query: `INSERT INTO orders (name, company, category, quantity, completed, priority, notes, start, id, log) 
      VALUES (${JSON.stringify(body.order.name)}, ${JSON.stringify(
      body.order.company
    )}, ${body.order.category}, ${body.order.quantity}, ${body.order.completed}, ${
      body.order.priority
    }, ${JSON.stringify(
      body.order.notes
    )}, CONVERT_TZ(UTC_TIMESTAMP(), "+00:00", "America/Los_Angeles"), ${JSON.stringify(
      body.order.id
    )},
    '${JSON.stringify(log)}')`,
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

  // Adds an entry to the log:

  const changelog = ["name", "company", "category", "quantity", "completed", "priority", "notes", "id", "end"].filter((change) => {
    if (change == "end") return body.originalOrder.end != null;
    if (change == "name" || change == "company" || change == "category" || change == "id") return true;
    return body.order[change] !== body.originalOrder[change]
  }).map((change) => {
    return {
      field: change,
      old: body.originalOrder[change],
      new: body.order[change],
    }
  })

  const logEntry = {
    action: "update",
    user: users[0].id,
    timestamp: (new Date()).toLocaleString('lt-LT', {timeZone: "America/Los_Angeles"}),
    values: changelog,
  }

  const updatedLog = body.originalOrder.log ? [ ...JSON.parse(body.originalOrder.log.escapeSpecialChars()), logEntry ] : [ logEntry ];

  // The request:
  const order = await query({
    // The SQL query:
    query: `UPDATE orders 
      SET 
        name = ${JSON.stringify(body.order.name)},
        company = ${JSON.stringify(body.order.company)},
        category = ${body.order.category},
        quantity = ${body.order.quantity}, 
        completed = ${body.order.completed}, 
        priority = ${body.order.priority},
        notes = ${JSON.stringify(body.order.notes)},
        id = ${JSON.stringify(body.order.id)},
        log = '${JSON.stringify(updatedLog)}',
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

  // Adds an entry to the log:

  // Adds an entry to the log:

  const values = ["name", "company", "category", "notes", "id"].map((change) => {
    return {
      field: change,
      value: body.order[change],
    }
  })

  const logEntry = {
    action: "delete",
    user: users[0].id,
    timestamp: (new Date()).toLocaleString('lt-LT', {timeZone: "America/Los_Angeles"}),
    values: values,
  }

  const updatedLog = body.order.log ? [ ...JSON.parse(body.order.log.escapeSpecialChars()), logEntry ] : [ logEntry ];

  // The request:
  const order = await query({
    // The SQL query:
    query: `UPDATE orders
      SET 
        end = CONVERT_TZ(UTC_TIMESTAMP(), "+00:00", "America/Los_Angeles"),
        log = '${JSON.stringify(updatedLog)}'
      WHERE order_id=${body.order.order_id}`,
    values: [],
  });

  // Returns a JSON representation of the data.
  return new Response(JSON.stringify(order));
}
