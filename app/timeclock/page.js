// This is an interactive component, so it's a client component.
"use client";

import React, { useState, useEffect } from "react";

import moment, { duration } from "moment";

import Link from "next/link";

/**
 * The default export for the view page.
 *
 * @returns JSX representation of the edit page.
 */
export default function App() {
  let [countdown, setCountdown] = useState(-1);

  let [employeeData, setEmployeeData] = useState("");
  let [timeclockData, setTimeclockData] = useState("");

  let [employees, setEmployees] = useState([]);

  let [start, setStart] = useState(
    moment().startOf("week").add(-2, "week").format("YYYY-MM-DD")
  );
  let [end, setEnd] = useState(
    moment().startOf("week").add(-1, "day").format("YYYY-MM-DD")
  );

  let [selected, setSelected] = useState(0);

  let [clock, setClock] = useState([]);
  let [changes, setChanges] = useState([]);
  let [changedClock, setChangedClock] = useState([]);

  useEffect(() => {
    setTimeclockData(
      localStorage.getItem("timeclockData")
        ? localStorage.getItem("timeclockData")
        : ""
    );

    setChanges(
      localStorage.getItem("changes")
        ? JSON.parse(localStorage.getItem("changes"))
        : []
    );
  }, []);

  useEffect(() => {
    let newClock = getClock(timeclockData, start, end, employees);

    if (timeclockData != "")
      localStorage.setItem("timeclockData", timeclockData);

    setClock(newClock);
  }, [start, end, timeclockData, employees]);

  useEffect(() => {
    setChangedClock(applyChanges(clock, changes));

    if (changes.length != 0)
      localStorage.setItem("changes", JSON.stringify(changes));
  }, [clock, changes]);

  useEffect(() => {
    if (employeeData != "") {
      let lines = employeeData.split("\n");

      let newEmployees = [];

      for (var i = 0; i < lines.length; i++) {
        if (lines[i][0] != "#" && lines[i].length > 1) {
          try {
            let values = lines[i].split(", ");

            let ID = values[0].trim();
            let shift = values[1].trim();
            let name = values[2].trim();

            let employee = { id: ID, shift: shift, name: name };

            newEmployees.push(employee);
          } catch (e) {}
        }
      }

      setEmployees(newEmployees);

      localStorage.setItem("employees", JSON.stringify(newEmployees));
    } else {
      setEmployees(
        localStorage.getItem("employees")
          ? JSON.parse(localStorage.getItem("employees"))
          : []
      );
    }
  }, [employeeData]);

  async function getEmployeeData(e) {
    e.preventDefault();
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      setEmployeeData(text);
    };
    if (Array.from(e.target.files).length > 0)
      reader.readAsText(e.target.files[0]);
  }

  async function getTimeclockData(e) {
    e.preventDefault();

    // Convert the FileList into an array and iterate
    let files = Array.from(e.target.files).map((file) => {
      // Define a new file reader
      let reader = new FileReader();

      // Create a new promise
      return new Promise((resolve) => {
        // Resolve the promise after reading file
        reader.onload = () => resolve(reader.result);

        // Read the file as a text
        reader.readAsText(file);
      });
    });

    // At this point you'll have an array of results
    let res = await Promise.all(files);

    setTimeclockData(res.join());

    localStorage.setItem("changes", JSON.stringify([]));
    setChanges([]);

    setClock(getClock(timeclockData, start, end, employees));
  }

  function deleteTime(id, unique) {
    let newChanges = [...changes];

    let entry = clock.find((entry) => entry.unique == unique);
    let change = newChanges.find((change) => change.unique == unique);

    if (change != undefined) {
      change.deleted = !change.deleted;
    } else {
      if (entry != undefined)
        newChanges.push({
          unique: unique,
          type: "update",
          deleted: !entry.deleted,
        });
      else newChanges.push({ unique: unique, type: "update", deleted: true });
    }

    setChanges(newChanges);
  }

  function setBreak(unique, hasBreak) {
    let newChanges = [...changes];

    let change = newChanges.find((change) => change.unique == unique);

    if (change != undefined) {
      change.hasBreak = hasBreak;
    } else {
      newChanges.push({ unique: unique, type: "update", hasBreak: hasBreak });
    }

    setChanges(newChanges);
  }

  function addTime(id, datetime) {
    if (datetime.length > 1) {
      let newChanges = [...changes];

      let date = datetime.substring(0, 10);
      let time = datetime.substring(11, 16) + ":00";

      newChanges.push({
        unique: countdown,
        type: "create",
        id: id,
        date: date,
        time: time,
        deleted: false,
        created: true,
        hasBreak: false,
      });

      setChanges(newChanges);

      setCountdown(countdown - 2);
    }
  }

  // JSX (RETURN VALUE)

  return (
    <>
      {/* HEADER */}
      <Menu />

      <div className="flex flex-col w-full px-4 m-auto mt-4 space-y-4 mb-60 lg:space-y-0 lg:space-x-4 lg:w-fit lg:flex-row">
        {/* DATA INPUT */}
        <div className="box-border w-full p-4 border-t-8 rounded shadow-lg lg:w-fit xl:p-6 h-fit border-t-cyan-800 bg-cool-grey-50">
          {/* <h2 className="mb-5 font-sans text-lg text-cool-grey-600">Data Input</h2> */}

          <div className="mb-6">
            <label
              className="font-sans text-xl font-semibold text-cool-grey-900"
              htmlFor="employee_data"
            >
              Employee Data
            </label>
            <input
              id="employee_data"
              className="block mt-1 text-sm w-44 text-cool-grey-500 file:block file:w-24 file:p-2 file:mb-1 file:text-cool-grey-700 file:border-0 file:border-cool-grey-500 file:border-solid file:rounded-md file:bg-cool-grey-100 hover:file:bg-cool-grey-200 file:transition-colors file:cursor-pointer"
              type="file"
              multiple={false}
              accept=".dat, .txt"
              onInput={(e) => {
                getEmployeeData(e);
              }}
              onClick={(e) => (e.target.value = null)}
            />
          </div>

          <div className="mb-6">
            <label
              className="font-sans text-xl font-semibold text-cool-grey-900"
              htmlFor="timeclock_data"
            >
              Timeclock Data
            </label>
            <input
              id="timeclock_data"
              className="block mt-1 text-sm w-44 text-cool-grey-500 file:block file:w-24 file:p-2 file:mb-1 file:text-cool-grey-700 file:border-0 file:border-cool-grey-500 file:border-solid file:rounded-md file:bg-cool-grey-100 hover:file:bg-cool-grey-200 file:transition-colors file:cursor-pointer"
              type="file"
              multiple={true}
              accept=".dat, .txt"
              onInput={(e) => {
                getTimeclockData(e);
              }}
              onClick={(e) => (e.target.value = null)}
            />
          </div>

          <div className="mb-6">
            <label
              className="font-sans text-cool-grey-600 text-md"
              htmlFor="start_date"
            >
              <span className="text-xl font-semibold text-cool-grey-900">
                Start Date
              </span>{" "}
              for Pay Period
            </label>
            <br />
            <input
              id="start_date"
              type="date"
              defaultValue={moment()
                .startOf("week")
                .add(-2, "week")
                .format("YYYY-MM-DD")}
              onChange={(e) => {
                setStart(e.target.value);
              }}
              className="w-32 p-2 mt-1 rounded text-md text-cool-grey-900 bg-cool-grey-100 focus:outline-cool-grey-500"
            />
          </div>

          <div className="mb-6">
            <label
              className="font-sans text-cool-grey-600 text-md"
              htmlFor="end_date"
            >
              <span className="text-xl font-semibold text-cool-grey-900">
                End Date
              </span>{" "}
              for Pay Period
            </label>
            <br />
            <input
              id="end_date"
              type="date"
              defaultValue={moment()
                .startOf("week")
                .add(-1, "day")
                .format("YYYY-MM-DD")}
              onChange={(e) => {
                setEnd(e.target.value);
              }}
              className="w-32 p-2 mt-1 rounded text-md text-cool-grey-900 bg-cool-grey-100 focus:outline-cool-grey-500"
            />
          </div>

          <div className="mb-3">
            <h3 className="font-sans text-xl font-semibold text-cool-grey-900">
              Select Employee
            </h3>
            <div className="flex mt-1">
              <select
                className="p-2 mr-2 rounded w-44 text-md text-cool-grey-900 bg-cool-grey-100 focus:outline-cool-grey-500"
                name="employee"
                id="employee"
                value={selected}
                onChange={(e) => {
                  setSelected(e.target.value);
                }}
              >
                <option value={0} key={0}>
                  Overview
                </option>
                {employees.map((employee) => {
                  return (
                    <option value={employee.id} key={employee.id}>
                      {employee.name}
                    </option>
                  );
                })}
              </select>
              <button
                className="block w-12 p-1 mr-2 transition-colors rounded text-md text-cool-grey-900 hover:bg-cool-grey-100 focus:outline-cool-grey-500"
                onClick={() => {
                  let next_employee = 0;

                  if (selected == 0 && employees.length > 0)
                    next_employee = employees[0].id;
                  else {
                    for (let i = 0; i < employees.length; i++) {
                      if (employees[i].id == selected) {
                        if (i + 1 < employees.length) {
                          next_employee = employees[i + 1].id;
                          break;
                        }
                      }
                    }
                  }

                  setSelected(next_employee);
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* EMPLOYEE DATA */}
        <div className="box-border flex flex-col w-full p-4 mb-8 border-t-8 rounded shadow-lg xl:p-6 lg:w-[640px] 2xl:w-[920px] md:flex-row border-t-cyan-800 bg-cool-grey-50">
          {employees.find((employee) => employee.id == selected) !=
            undefined && (
            <EmployeeData
              employee={employees.find((employee) => employee.id == selected)}
              data={changedClock.filter((entry) => selected == entry.id)}
              deleteTime={deleteTime}
              addTime={addTime}
              setBreak={setBreak}
              start={start}
              end={end}
            />
          )}
          {selected == 0 && (
            <Overview
              employees={employees}
              data={changedClock}
              start={start}
              end={end}
            />
          )}
        </div>
      </div>
    </>
  );
}

function Overview({ employees, data, start, end }) {
  return (
    <>
      <div>
        <h3 className="block font-sans text-xl font-semibold text-cool-grey-900">
          Employees
        </h3>
        <div className="mt-3">
          {employees.map((employee) => {
            return (
              <li key={employee.id} className="pb-2 pl-2 leading-5 list-none">
                <div className="text-lg font-semibold text-cool-grey-900">
                  {employee.name}
                </div>
                <div className="pl-2 text-cool-grey-800">
                  {findHours({
                    data: data.filter((entry) => {
                      return entry.id == employee.id && !entry.deleted;
                    }),
                  })}
                </div>
              </li>
            );
          })}
          <li key={-1} className="pb-2 pl-2 leading-5 list-none">
            <div className="text-lg font-semibold text-cool-grey-900">
              Total
            </div>
            <div className="pl-2 text-cool-grey-800">
              { 
                minutesToString(
                  employees.reduce((prev, employee) => prev + findMinutes({
                    data: data.filter((entry) => {
                      return entry.id == employee.id && !entry.deleted;
                    }),
                  }), 0)
                )
              }
            </div>
          </li>
        </div>
      </div>
    </>
  );
}

function EmployeeData({
  employee,
  data,
  deleteTime,
  addTime,
  setBreak,
  start,
  end,
}) {
  useEffect(() => {}, [employee, data]);

  const [datetime, setDatetime] = useState("");

  const timeclockRows = [];

  let gap = 0;

  let first, second;

  let clockinRow = [];

  for (let i = 0; i < data.length; i++) {
    let clockin = data[i];

    clockinRow.push(
      <p
        className={`${"cursor-pointer mb-1 text-cool-grey-900"}
                            ${clockin.deleted && "line-through"}
                            ${clockin.created && "font-bold"} `}
        key={clockin.unique}
        onClick={() => {
          deleteTime(clockin.id, clockin.unique);
        }}
      >
        {moment(clockin.date + " " + clockin.time).format("M/DD/YY - h:mm A")}
      </p>
    );

    if (!clockin.deleted) {
      gap++;

      if (gap % 2 == 1) {
        first = moment(clockin.date + " " + clockin.time);
      } else {
        second = moment(clockin.date + " " + clockin.time);

        let length = (second - first) / (1000 * 60 * 60);

        if (clockin.hasBreak) length -= 0.5;

        let hours = Math.floor(length);
        let minutes = Math.floor(60 * (length % 1));

        if (minutes < 0 || hours < 0) {
          minutes = 0;
          hours = 0;
        }

        timeclockRows.push(
          <div className="mb-6 w-60 h-fit" key={clockin.unique}>
            <p className="text-lg font-semibold">{`${hours} ${
              hours != 1 ? "hours" : "hour"
            }, ${minutes} ${minutes != 1 ? "minutes" : "minute"}`}</p>
            {clockinRow}
            <div className="flex mt-2">
              <input
                id={clockin.unique + "break"}
                className="w-4 h-4 accent-cyan-800"
                type="checkbox"
                checked={clockin.hasBreak}
                onChange={(e) => setBreak(clockin.unique, e.target.checked)}
              />
              <label
                htmlFor={clockin.unique + "break"}
                className="pl-1 leading-4 text-gray-600 text-md"
              >
                {" "}
                Break
              </label>
            </div>
          </div>
        );

        clockinRow = [];
      }
    }

    if (i + 1 == data.length && clockinRow.length != 0) {
      timeclockRows.push(
        <div className="mb-6 w-60 h-fit" key={clockin.unique}>
          <p className="text-lg font-semibold">Incomplete Shift</p>
          {clockinRow}
        </div>
      );
    }
  }

  return (
    <>
      <div className="font-sans lg:w-80 md:mr-8 lg:mr-0 2xl:mr-24">
        <h3 className="mb-4 font-sans text-xl font-semibold text-cool-grey-900">
          {employee.name} (ID {employee.id}, Shift {employee.shift})
        </h3>
        <div className="mb-3">
          <input
            className="h-8 p-1 mr-2 border rounded shadow-md w-60 text-md text-cool-grey-900 bg-cool-grey-100 border-cyan-800 focus:outline-cool-grey-500"
            type="datetime-local"
            onChange={(e) => setDatetime(e.target.value)}
          />
          <button
            className="inline w-12 h-8 p-1 mt-2 transition-colors rounded text-md text-cool-grey-900 bg-cool-grey-100 hover:bg-cool-grey-200 focus:outline-cool-grey-500"
            onClick={(e) => addTime(employee.id, datetime)}
          >
            Add
          </button>
        </div>
        <div>{timeclockRows}</div>
      </div>
      <div className="text-cool-grey-900">
        {/* <h3 className="mb-4 font-sans text-xl font-semibold text-cool-grey-900">Results</h3> */}
        <p className="text-sm min-[400px]:text-base tracking-[-0.1em] min-[400px]:tracking-tight whitespace-pre font-Courier">
          <span className="font-bold">Total:</span>{" "}
          {findHours({ data: data.filter((entry) => !entry.deleted) })} <br />
          <br />
          {generateGraphic({
            data: data.filter((entry) => !entry.deleted),
            start,
            end,
          })}
        </p>
      </div>
    </>
  );
}

function getClock(data, start, end, employees) {
  let newClock = [];

  let unique = 0;

  let lines = data.split("\n");

  let last = {};

  for (var i = 0; i < lines.length; i++) {
    if (lines[i][0] != "#" && lines[i].length > 1) {
      try {
        let values = lines[i].split(/(\s)/).filter((x) => x.trim().length > 0);

        let ID = values[0];
        let date = values[1];
        let time = values[2];

        let employee = employees.find((e) => e.id == ID);

        let double = false;
        let hasBreak = false;

        if (last[ID] != undefined) {
          double = (moment(date + " " + time) - last[ID]) / 1000 < 60;
          if (employee != undefined && employee.shift == 1)
            hasBreak =
              (moment(date + " " + time) - last[ID]) / (1000 * 60) > 360;
        }

        last[ID] = moment(date + " " + time);

        let clockin = {
          unique: unique,
          id: ID,
          date: date,
          time: time,
          deleted: double,
          created: false,
          hasBreak: hasBreak,
        };

        if (start <= date && date <= end) {
          newClock.push(clockin);
          unique++;
        }
      } catch (e) {}
    }
  }

  return newClock;
}

function applyChanges(clock, changes) {
  let changedClock = [...clock];

  for (let i = 0; i < changes.length; i++) {
    let change = changes[i];

    if (change.type == "create") {
      if (!change.deleted)
        changedClock.push({
          unique: change.unique,
          id: change.id,
          date: change.date,
          time: change.time,
          deleted: change.deleted,
          created: change.created,
          hasBreak: change.hasBreak,
        });
    } else if (change.type == "update") {
      let match = changedClock.find(
        (clockin) => change.unique == clockin.unique
      );

      if (match != undefined) {
        if (change.deleted != undefined) match.deleted = change.deleted;
        if (change.hasBreak != undefined) match.hasBreak = change.hasBreak;
      }
    }
  }

  changedClock.sort((a, b) => {
    return moment(a.date + " " + a.time) - moment(b.date + " " + b.time);
  });

  return changedClock;
}

function findHours({ data }) {
  let total_hours = 0;

  for (let i = 0; i < data.length - 1; i += 2) {
    let first = data[i];
    let second = data[i + 1];

    let start_time = moment(first.date + " " + first.time);
    let end_time = moment(second.date + " " + second.time);

    let length = (end_time - start_time) / (1000 * 60 * 60);

    if (second.hasBreak) length -= 0.5;

    if (length < 0) length = 0;

    total_hours += length;
  }

  let hours = Math.floor(total_hours);
  let minutes = Math.floor(60 * (total_hours % 1));

  let output = `${hours} ${hours != 1 ? "hours" : "hour"}, ${minutes} ${
    minutes != 1 ? "minutes" : "minute"
  }`;

  return output;
}

function findMinutes({ data }) {
  let total_hours = 0;

  for (let i = 0; i < data.length - 1; i += 2) {
    let first = data[i];
    let second = data[i + 1];

    let start_time = moment(first.date + " " + first.time);
    let end_time = moment(second.date + " " + second.time);

    let length = (end_time - start_time) / (1000 * 60 * 60);

    if (second.hasBreak) length -= 0.5;

    if (length < 0) length = 0;

    total_hours += length;
  }

  let minutes = Math.floor(60 * total_hours);

  return minutes;
}

function minutesToString(totalMinutes) {
  let hours = Math.floor(totalMinutes / 60);
  let minutes = totalMinutes % 60;

  let output = `${hours} ${hours != 1 ? "hours" : "hour"}, ${minutes} ${
    minutes != 1 ? "minutes" : "minute"
  }`;

  return output;
}

function findHoursRange({ data, start, end }) {
  let total_hours = 0;

  data = data.filter((datum) => {
    return moment(
      datum.date + " " + datum.time,
      "YYYY-MM-DD hh:mm:ss"
    ).isBetween(
      moment(start, "MM/DD/YYYY hh:mm A"),
      moment(end, "MM/DD/YYYY hh:mm A")
    );
  });

  for (let i = 0; i < data.length - 1; i += 2) {
    let first = data[i];
    let second = data[i + 1];

    let start_time = moment(first.date + " " + first.time);
    let end_time = moment(second.date + " " + second.time);

    let length = (end_time - start_time) / (1000 * 60 * 60);

    if (second.hasBreak) length -= 0.5;

    if (length < 0) length = 0;

    total_hours += length;
  }

  let hours = Math.floor(total_hours);
  let minutes = Math.floor(60 * (total_hours % 1));

  let output = `${hours} ${hours != 1 ? "hours" : "hour"}, ${minutes} ${
    minutes != 1 ? "minutes" : "minute"
  }`;

  return output;
}

function generateGraphic({ data, start, end }) {
  let graphic = [];

  let size = moment.duration(moment(end).diff(moment(start))).as("days") + 1;

  for (let i = 0; i < size; i++) {
    for (let z = 0; z < 24; z++) graphic.push("·");
  }

  for (let i = 0; i < data.length - 1; i += 2) {
    let first = data[i];
    let second = data[i + 1];

    let start_time = moment(first.date + " " + first.time);
    let end_time = moment(second.date + " " + second.time);

    let first_duration = Math.floor(
      moment.duration(moment(start_time).diff(moment(start))).as("hours")
    );
    let second_duration = Math.floor(
      moment.duration(moment(end_time).diff(moment(start))).as("hours")
    );

    if (first_duration < 0) first_duration = -1;
    if (second_duration >= size * 24) second_duration = size * 24;

    if (graphic[first_duration] == "·") graphic[first_duration] = "[";
    else graphic[first_duration] = "|";

    if (graphic[second_duration] == "·") graphic[second_duration] = "]";
    else graphic[second_duration] = "|";

    for (let i = first_duration + 1; i < second_duration; i++) {
      graphic[i] = "$";
    }
  }

  if (data.length % 2 == 1) {
    let first = data[data.length - 1];

    let start_time = moment(first.date + " " + first.time);

    let first_duration = Math.floor(
      moment.duration(moment(start_time).diff(moment(start))).as("hours")
    );

    if (first_duration < 0) first_duration = -1;

    graphic[first_duration] = "[";

    for (let i = first_duration + 1; i < size * 24; i++) {
      graphic[i] = "?";
    }
  }

  let output = "";

  for (let i = 0; i < size; i++) {
    output += moment(start).add(i, "day").format("MM/DD dd:");
    output += " ";
    for (let z = 0; z < 24; z++) output += graphic[i * 24 + z];
    output += "\n";
    if (i % 7 == 6) {
      let week_start = moment(start)
        .add(i, "day")
        .add(-6, "day")
        .format("MM/DD/YYYY [12:00 AM]");
      let week_end = moment(start)
        .add(i, "day")
        .format("MM/DD/YYYY [11:59 PM]");
      output +=
        findHoursRange({ data, start: week_start, end: week_end }) + "\n";
      output += "\n";
    }
  }

  return output;
}

// The menu bar component.
function Menu() {
  return (
    <>
      <div className="invisible h-16 font-RobotoMono" />
      <div className="fixed top-0 z-10 w-screen h-16 m-auto shadow-xl bg-cool-grey-50">
        <div className="relative max-w-[1000px] mx-auto">
          <div className="absolute invisible w-full mx-auto mt-1 text-lg font-semibold text-center sm:visible top-4">
            Timeclock Tool
          </div>
          <Link href="./" className="absolute">
            <img src="./inverted-logo.png" className="h-12 mt-2 ml-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
