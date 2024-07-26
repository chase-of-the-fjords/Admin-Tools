import { query } from "@/lib/db";

// Always revalidates data when accessed.
export const revalidate = 0;

String.prototype.escapeSpecialChars = function() {
  return this.replaceAll("\n", "\\n")
             .replaceAll("\r", "\\r");
};

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

  // Adds an entry to the log:

  const logEntry = {
    action: "create",
    user: users[0].id,
    timestamp: (new Date()).toLocaleString('lt-LT', {timeZone: "America/Los_Angeles"}),
    values: {
      name: body.company.name,
      image: body.company.image,
      priority: body.company.priority,
      notes: body.company.notes
    }
  }

  const log = [ logEntry ];

  // The request:
  const company = await query({
    // The SQL query:
    query: `INSERT INTO companies (name, image, priority, notes, active, log) 
      VALUES (${JSON.stringify(body.company.name)}, 
      ${JSON.stringify(body.company.image)},
      ${body.company.priority},
      ${JSON.stringify(body.company.notes)},
      1,
      '${JSON.stringify(log)}')`,
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

  // Adds an entry to the log:

  const changelog = ["name", "image", "priority", "notes"].filter((change) => {
    if (change == "name") return true;
    return body.company[change] !== body.originalCompany[change]
  }).map((change) => {
    return {
      field: change,
      old: body.originalCompany[change],
      new: body.company[change],
    }
  })

  const logEntry = {
    action: "update",
    user: users[0].id,
    timestamp: (new Date()).toLocaleString('lt-LT', {timeZone: "America/Los_Angeles"}),
    values: changelog,
  }

  const updatedLog = body.originalCompany.log ? [ ...JSON.parse(body.originalCompany.log.escapeSpecialChars()), logEntry ] : [ logEntry ];

  // The request:
  const company = await query({
    // The SQL query:
    query: `UPDATE companies 
      SET 
        name = ${JSON.stringify(body.company.name)},
        image = ${JSON.stringify(body.company.image)},
        priority = ${JSON.stringify(body.company.priority)},
        notes = ${JSON.stringify(body.company.notes)},
        log = '${JSON.stringify(updatedLog)}'
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

  // Adds an entry to the log:

  const changelog = ["name", "notes"].map((change) => {
    return {
      field: change,
      value: body.company[change]
    }
  })

  const logEntry = {
    action: "delete",
    user: users[0].id,
    timestamp: (new Date()).toLocaleString('lt-LT', {timeZone: "America/Los_Angeles"}),
    values: changelog,
  }

  const updatedLog = body.company.log ? [ ...JSON.parse(body.company.log.escapeSpecialChars()), logEntry ] : [ logEntry ];

  // The request:
  const company = await query({
    // The SQL query:
    query: `UPDATE companies
      SET 
        active = 0,
        log = '${JSON.stringify(updatedLog)}'
      WHERE id=${body.company.id}`,
    values: [],
  });

  // Returns a JSON representation of the data.
  return new Response(JSON.stringify(company));
}
