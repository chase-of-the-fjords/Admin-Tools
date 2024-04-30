/**
 * Gets orders from the SQL database and stores them in the orders hook.
 */
export async function getOrders({ setOrders }) {
  // The data being passed into the API.
  const postData = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  };

  // Gets the data.
  try {
    // Accesses the orders API.
    const res = await fetch(`${window.location.origin}/api/orders`, postData);
    const response = await res.json();

    setOrders(response);
  } catch (e) {
    console.error(e);
  }
}

/**
 * Creates a new order given an order object.
 */
export async function createOrder({ order, user }) {
  // The data being passed into the API.
  const postData = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ order, user }),
  };

  // Accesses the orders API.
  const res = await fetch(`${window.location.origin}/api/orders`, postData);
}

/**
 * Edits an existing order given an order object.
 */
export async function editOrder({ order, user }) {
  // The data being passed into the API.
  const postData = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ order, user }),
  };

  // Accesses the orders API.
  const res = await fetch(`${window.location.origin}/api/orders`, postData);
}

/**
 * Gets orders from the SQL database and stores them in the orders hook.
 */
export async function deleteOrder({ order, user }) {
  // The data being passed into the API.
  const postData = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ order, user }),
  };

  // Accesses the orders API.
  const res = await fetch(`${window.location.origin}/api/orders`, postData);
}

/**
 * Gets companies from the SQL database and stores them in the companies hook.
 */
export async function getCompanies({ setCompanies }) {
  // The data being passed into the API.
  const postData = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  };

  // Gets the data.
  try {
    // Accesses the companies API.
    const res = await fetch(
      `${window.location.origin}/api/companies`,
      postData
    );
    const response = await res.json();

    setCompanies(response);
  } catch (e) {
    console.error(e);
  }
}

export async function getLoginInfo({ user, setUser }) {
  // The data being passed into the API.
  const postData = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  };

  // Gets the data.
  try {
    // Accesses the companies API.
    const res = await fetch(
      `${window.location.origin}/api/user/${user.password}`,
      postData
    );
    const response = await res.json();

    setUser(response);

    return response;
  } catch (e) {
    console.error(e);
  }
}
