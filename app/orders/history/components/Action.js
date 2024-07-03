export default function Action({ action }) {
	if (action.action == "delete order") return DeletedOrder({ action });
	if (action.action == "update order") return UpdatedOrder({ action });
	if (action.action == "create order") return CreatedOrder({ action });

	return <p>{action.action}</p>;
}

function DeletedOrder({ action }) {

	let name = getField("name", action).value.trim();
	let company = getField("company", action).value.trim();
	let id = getField("id", action).value.trim();

	return (<>
		<h4>
			{"Deleted "}
			<span className="font-semibold">{name}</span>
			{id && <span className="text-base text-cool-grey-600">{` #${id}`}</span>}
			{` from `}
			<span className="font-semibold">{`${company}`}</span>
		</h4>
	</>
);
}

function UpdatedOrder({ action }) {

	let name = getField("name", action).old.trim();

	let nameField = getField("name", action);
	let companyField = getField("company", action);
	let quantityField = getField("quantity", action);
	let completedField = getField("completed", action);
	let categoryField = getField("category", action);
	let priorityField = getField("priority", action);
	let idField = getField("id", action);
	let notesField = getField("notes", action);
	let endField = getField("end", action);

	let isUpdated = {};

	isUpdated["name"] = (nameField != undefined && nameField.old != nameField.new)
	isUpdated["company"] = (companyField != undefined && companyField.old != companyField.new)
	isUpdated["quantity"] = (quantityField != undefined && quantityField.old != quantityField.new)
	isUpdated["completed"] = (completedField != undefined && completedField.old != completedField.new)
	isUpdated["category"] = (categoryField != undefined && categoryField.old != categoryField.new)
	isUpdated["priority"] = (priorityField != undefined && priorityField.old != priorityField.new)
	isUpdated["id"] = (idField != undefined && idField.old != idField.new)
	isUpdated["notes"] = (notesField != undefined && notesField.old != notesField.new)
	isUpdated["end"] = (endField != undefined && endField.old != endField.new)

	return (<>
		<h4>
			{isUpdated.end ? "Restored " : "Updated "}
			<span className="font-semibold">{name}</span>
		</h4>
		{isUpdated.name && <h5 className="ml-2 text-base sm:ml-4">
			<span className="text-sm text-cool-grey-500">{`NAME `}</span>{`${nameField.old} → ${nameField.new}`}
		</h5>}
		{isUpdated.id && <h5 className="ml-2 text-base sm:ml-4">
			<span className="text-sm text-cool-grey-500">{`ID `}</span>{`#${idField.old} → #${idField.new}`}
		</h5>}
		{isUpdated.company && <h5 className="ml-2 text-base sm:ml-4">
			<span className="text-sm text-cool-grey-500">{`COMPANY `}</span>{`${companyField.old} → ${companyField.new}`}
		</h5>}
		{isUpdated.completed && <h5 className="ml-2 text-base sm:ml-4">
			<span className="text-sm text-cool-grey-500">{`COMPLETED `}</span>{`${completedField.old} → ${completedField.new}`}
		</h5>}
		{isUpdated.quantity && <h5 className="ml-2 text-base sm:ml-4">
			<span className="text-sm text-cool-grey-500">{`QUANTITY `}</span>{`${quantityField.old} → ${quantityField.new}`}
		</h5>}
		{isUpdated.priority && <h5 className="ml-2 text-base sm:ml-4">
			<span className="text-sm text-cool-grey-500">{`PRIORITY `}</span>{`${priorityField.old} → ${priorityField.new}`}
		</h5>}
		{isUpdated.category && <h5 className="ml-2 text-base sm:ml-4">
			<span className="text-sm text-cool-grey-500">{`CATEGORY `}</span>{`${categoryField.old} → ${categoryField.new}`}
		</h5>}
		{isUpdated.notes && <h5 className="ml-2 text-base sm:ml-4">
			<span className="text-sm text-cool-grey-500">{`NOTES `}</span>{`have been updated`}
		</h5>}
		{!Object.values(isUpdated).some(e => e) && <h5 className="ml-2 text-base sm:ml-4">
			<span className="text-sm text-cool-grey-500">{`NO VALUES CHANGED`}</span>
		</h5>}
	</>);
}

function CreatedOrder({ action }) {
	return (<>
			<h4>
				{"Created "}
				<span className="font-semibold">{action.values.name}</span>
				{action.values.id && <span className="text-base text-cool-grey-600">{` #${action.values.id}`}</span>}
				{` from `}
				<span className="font-semibold">{`${action.values.company}`}</span>
			</h4>
			<h5 className="ml-2 text-base sm:ml-4">
				{`${action.values.priority} Priority ${action.values.category}`}
				</h5>
			<h5 className="ml-2 text-base sm:ml-4">
				{`${action.values.quantity} Orders`}
				{action.values.completed > 0 && <span>{`, ${action.values.completed} Completed`}</span>}
			</h5>
			{action.values.notes && <>
				<h5 className="mt-1 text-base font-semibold">
					Notes
				</h5>
				<h5 className="ml-2 text-base whitespace-pre-line sm:ml-4">
					{action.values.notes}
				</h5>
			</>}
		</>
	);
}

function getField(field, action) {
	
	return action.values.find((v) => v.field == field);

}
