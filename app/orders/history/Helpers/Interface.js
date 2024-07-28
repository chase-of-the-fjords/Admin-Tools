// Helper library for processing time.
import moment from "moment/moment";

let escapeSpecialChars = function(str) {
  return str.replaceAll("\n", "\\n")
             .replaceAll("\r", "\\r");
};

/**
 * Gets orders from the SQL database for a given interval.
 *
 * @param {string} start - The starting date ('YYYY-MM-DD').
 * @param {string} end - The ending date ('YYYY-MM-DD').
 *
 * @return All orders for a given interval.
 */
export async function getOrdersInterval(start, end) {
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
		const res = await fetch(
			`${window.location.origin}/api/orders/${start}:${end}`,
			postData
		);
		const response = await res.json();

		// Stores the value.
		return response;
	} catch (e) {}

	return [];
}

/**
 * Gets companies from the SQL database.
 *
 * @return The companies from the database.
 */
export async function getCompanies() {
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
		const res = await fetch(
			`${window.location.origin}/api/companies`,
			postData
		);
		const response = await res.json();

		// Stores the value.
		return response;
	} catch (e) {}

	return [];
}

/**
 * Finds a history of everything that happened in the shop between two dates.
 *
 * @param {string} start - A string representation of the starting date ('YYYY-MM-DD').
 * @param {string} end - A string representation of the ending date ('YYYY-MM-DD').
 *
 * @returns An object containing a log of everything that happened.
 */
export async function getLog(start, end, filter = "") {
	// Gets all orders that existed in that interval.
	let orders = await getOrdersInterval(start, end);
	let companies = await getCompanies();

	let companyDictionary = {};
	let priorityDictionary = {
		0: "Low",
		1: "Medium",
		2: "High",
	}
	let categoryDictionary = {
		0: "Putter",
		1: "Accessory"
	}

	companies.forEach((company) => {
		companyDictionary[company.id] = company.name;
	})

	let orderLogs = [];

	orders.forEach((order) => {
		let orderLog = order.log ? JSON.parse(escapeSpecialChars(order.log)) : [];
		orderLog.forEach((ol) => {
			orderLogs.push(ol);
		})
	})

	orderLogs = orderLogs.sort((a, b) => {
		if (a.timestamp > b.timestamp) return -1;
		else if (a.timestamp < b.timestamp) return 1;
		return 0;
	})

	orderLogs.forEach((log) => {
		log.action = log.action + " order"
		log.user = getUser(log.user);
		log.date = moment(log.timestamp).format("MMMM Do, YYYY");
		log.time = moment(log.timestamp).format("h:mm:ss a");

		if (log.action == "update order" || log.action == "delete order") {
			log.values.forEach((value) => {
				if (value.field == "company") {
					if (value.old != undefined) value.old = companyDictionary[value.old];
					if (value.new != undefined) value.new = companyDictionary[value.new];
					if (value.value != undefined) value.value = companyDictionary[value.value];
				}
				if (value.field == "priority") {
					if (value.old != undefined) value.old = priorityDictionary[value.old];
					if (value.new != undefined) value.new = priorityDictionary[value.new];
					if (value.value != undefined) value.value = priorityDictionary[value.value];
				}
				if (value.field == "category") {
					if (value.old != undefined) value.old = categoryDictionary[value.old];
					if (value.new != undefined) value.new = categoryDictionary[value.new];
					if (value.value != undefined) value.value = categoryDictionary[value.value];
				}
			})
		} else if (log.action == "create order") {
			log.values.company = companyDictionary[log.values.company];
			log.values.priority = priorityDictionary[log.values.priority];
			log.values.category = categoryDictionary[log.values.category];
		}
	})

	return orderLogs;
}

/**
 * Gets the user name given their ID.
 *
 * @param {number} id - The ID of the user.
 *
 * @returns The name of the user.
 */
export function getUser(id) {
	// Based on user ID, return name.
	if (id == 1) return "Kevin";
	if (id == 2) return "Chase";
	if (id == 3) return "Ernie";
	if (id == 4) return "Rocky";
	if (id == 5) return "Gerardo";
	if (id == 6) return "Nick";

	// If the user isn't found, return N/A.
	return "N/A";
}

export function runFilter(log, filter) {
	let filteredLog = [];

	for (let i = 0; i < log.length; i++) {
		let entry = log[i];

		let date = moment.utc(entry.timestamp).format("MMMM DD, YYYY");
		let time = moment.utc(entry.timestamp).format("h:mm:ss A");

		if (entry.action == "created job") {
			if (
				listIncludes(
					[
						date,
						time,
						entry.action,
						entry.machine,
						entry.op,
						entry.notes,
						entry.state,
						entry.user,
					],
					filter
				)
			)
				filteredLog.push(log[i]);
		} else if (entry.action == "updated job") {
			let changes = [];
			if (entry.changes.op != undefined) {
				changes.push(entry.changes.op.new);
				changes.push(entry.changes.op.old);
			}
			if (entry.changes.notes != undefined) {
				changes.push(entry.changes.notes.new);
				changes.push(entry.changes.notes.old);
			}
			if (entry.changes.state != undefined) {
				changes.push(entry.changes.state.new);
				changes.push(entry.changes.state.old);
			}

			if (
				listIncludes(
					[
						date,
						time,
						entry.action,
						entry.machine,
						entry.op,
						entry.user,
						...changes,
					],
					filter
				)
			)
				filteredLog.push(log[i]);
		} else if (entry.action == "deleted job") {
			if (
				listIncludes(
					[
						date,
						time,
						entry.action,
						entry.machine,
						entry.op,
						entry.notes,
						entry.state,
						entry.user,
					],
					filter
				)
			)
				filteredLog.push(log[i]);
		} else if (entry.action == "created machine") {
			if (
				listIncludes(
					[
						date,
						time,
						entry.action,
						entry.building,
						entry.state,
						`(${entry.xpos}, ${entry.ypos})`,
						`${entry.width}x${entry.height}`,
						entry.user,
					],
					filter
				)
			)
				filteredLog.push(log[i]);
		} else if (entry.action == "updated machine") {
			let changes = [];
			if (entry.changes.state != undefined) {
				changes.push(entry.changes.state.new);
				changes.push(entry.changes.state.old);
			}

			if (
				listIncludes([date, time, entry.action, entry.user, ...changes], filter)
			)
				filteredLog.push(log[i]);
		}
	}

	return filteredLog;
}

function listIncludes(list, text) {
	for (let i = 0; i < list.length; i++) {
		let item = list[i];
		if (item.toUpperCase().includes(text.toUpperCase())) return true;
	}
	return false;
}
