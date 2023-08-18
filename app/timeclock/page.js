// This is an interactive component, so it's a client component.
'use client'

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

    let [start, setStart] = useState((moment().startOf('week').add(-2, 'week')).format('YYYY-MM-DD'));
    let [end, setEnd] = useState((moment().startOf('week').add(-1, 'day')).format('YYYY-MM-DD'));

    let [selected, setSelected] = useState(0);

    let [clock, setClock] = useState([]);
    let [changes, setChanges] = useState([]);
    let [changedClock, setChangedClock] = useState([]);

    useEffect(() => {
        
        let newClock = getClock(timeclockData, start, end, employees);

        setClock(newClock);

    }, [start, end, timeclockData, employees])

    useEffect(() => {

        setChangedClock(applyChanges(clock, changes));

    }, [clock, changes])

    useEffect(() => {
        
        if (employeeData != "") {

            let lines = employeeData.split('\n');

            let newEmployees = [];

            for (var i = 0; i < lines.length; i++){
                
                if (lines[i][0] != '#' && lines[i].length > 1) {
                    
                    try {

                        let values = lines[i].split(', ');

                        let ID = values[0].trim();
                        let shift = values[1].trim();
                        let name = values[2].trim();

                        let employee = {id: ID, shift: shift, name: name};

                        newEmployees.push(employee);

                    } catch (e) {}

                }

            }
            
            setEmployees(newEmployees);

            localStorage.setItem('employees', JSON.stringify(newEmployees));

        } else {
            
            setEmployees(localStorage.getItem('employees') ? JSON.parse(localStorage.getItem('employees')) : []);

        }

    }, [employeeData]);

    async function getEmployeeData(e) {

        e.preventDefault()
        const reader = new FileReader()
        reader.onload = async (e) => { 
            const text = (e.target.result)
            setEmployeeData(text);
        };
        if (Array.from(e.target.files).length > 0) reader.readAsText(e.target.files[0])

    }

    async function getTimeclockData(e) {

        e.preventDefault();

        setChanges([]);

        // Convert the FileList into an array and iterate
        let files = Array.from(e.target.files).map(file => {

            // Define a new file reader
            let reader = new FileReader();

            // Create a new promise
            return new Promise(resolve => {

                // Resolve the promise after reading file
                reader.onload = () => resolve(reader.result);

                // Read the file as a text
                reader.readAsText(file);

            });

        });

        // At this point you'll have an array of results
        let res = await Promise.all(files);

        setTimeclockData(res.join());

    }

    function deleteTime(id, unique) {

        console.log(unique);

        let newChanges = [...changes];

        let entry = clock.find((entry) => (entry.unique == unique));
        let change = newChanges.find((change) => (change.unique == unique));

        if (change != undefined) {

            change.deleted = !change.deleted;

        } else {

            if (entry != undefined) newChanges.push({ unique: unique, type: "update", deleted: !entry.deleted });
            else newChanges.push({ unique: unique, type: "update", deleted: true });

        }

        setChanges(newChanges);

    }

    function setBreak(unique, hasBreak) {

        let newChanges = [...changes];

        let change = newChanges.find((change) => (change.unique == unique));

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
            let time = datetime.substring(11,16) + ":00";

            newChanges.push({unique: countdown, type: "create", id: id, date: date, time: time, deleted: false, created: true, hasBreak: false});

            setChanges(newChanges);

            setCountdown(countdown - 2);

        }

    }

        // JSX (RETURN VALUE)

    return (<>

        {/* <a href="./" className="block bg-cool-grey-50 ml-3 mt-3 text-lg border border-black w-fit px-2 cursor-pointer hover:bg-gray-100 transition-colors text-center rounded-md">
            Back to Admin
        </a> */}

        {/* HEADER */}
        <div className="relative bg-cool-grey-50 m-auto h-7 shadow-xl">
            <h1 className="absolute w-full text-center text-2xl bottom-2 text-cool-grey-900 font-semibold">Timeclock Tool</h1>
            <Link className="absolute text-cool-grey-500 hover:text-cool-grey-700 bottom-3 left-5 cursor-pointer" href="./">Back to Admin</Link>
        </div>

        <div className="flex w-fit m-auto mt-2">

            {/* DATA INPUT */}
            <div className="p-6 m-3 h-fit w-13 border-t-cyan-800 border-t-8 rounded bg-cool-grey-50 shadow-lg">

                {/* <h2 className="font-sans text-lg mb-5 text-cool-grey-600">Data Input</h2> */}
                
                <div className="mb-5">
                <label className="font-sans text-cool-grey-900 text-xl font-semibold" htmlFor="employee_data">Employee Data</label>
                    <input id="employee_data" 
                            className="block w-11 mt-1 text-cool-grey-500 text-sm
                                       file:block file:w-9 file:p-2 file:mb-1
                                       file:text-cool-grey-700 
                                       file:border-0 file:border-cool-grey-500 file:border-solid file:rounded-md 
                                       file:bg-cool-grey-100 hover:file:bg-cool-grey-200 file:transition-colors
                                       file:cursor-pointer" 
                            type="file" multiple={false} accept=".dat, .txt" onInput={e => { getEmployeeData(e) }} 
                            onClick={ (e) => e.target.value = null } />
                </div>

                <div className="mb-5">
                    <label className="font-sans text-cool-grey-900 text-xl font-semibold" htmlFor="timeclock_data">Timeclock Data</label>
                    <input id="timeclock_data" 
                            className="block w-11 mt-1 text-cool-grey-500 text-sm
                                        file:block file:w-9 file:p-2 file:mb-1
                                        file:text-cool-grey-700 
                                        file:border-0 file:border-cool-grey-500 file:border-solid file:rounded-md 
                                        file:bg-cool-grey-100 hover:file:bg-cool-grey-200 file:transition-colors
                                        file:cursor-pointer" 
                            type="file" multiple={true} accept=".dat, .txt" onInput={e => { getTimeclockData(e) }} 
                            onClick={ (e) => e.target.value = null } />
                </div>

                <div className="mb-5">
                <label className="font-sans text-cool-grey-600 text-md" htmlFor="start_date"><span className="text-xl text-cool-grey-900 font-semibold">Start Date</span> for Pay Period</label>
                    <input id="start_date" type="date" defaultValue={(moment().startOf('week').add(-2, 'week')).format('YYYY-MM-DD')} onChange={e => { setStart(e.target.value) }} 
                            className="w-10 p-2 mt-1 text-md text-cool-grey-900 bg-cool-grey-100 focus:outline-cool-grey-500 rounded" />
                </div>

                <div className="mb-5">
                    <label className="font-sans text-cool-grey-600 text-md" htmlFor="end_date"><span className="text-xl text-cool-grey-900 font-semibold">End Date</span> for Pay Period</label>
                    <input id="end_date" type="date" defaultValue={(moment().startOf('week').add(-1, 'day')).format('YYYY-MM-DD')} onChange={e => { setEnd(e.target.value) }} 
                            className="w-10 p-2 mt-1 text-md text-cool-grey-900 bg-cool-grey-100 focus:outline-cool-grey-500 rounded" />
                </div>

                <div className="mb-3">
                    <h3 className="font-sans text-xl font-semibold text-cool-grey-900">Select Employee</h3>
                    <div className="flex mt-1">
                        <select className="w-11 p-2 mr-2 text-md text-cool-grey-900 bg-cool-grey-100 focus:outline-cool-grey-500 rounded" name="employee" id="employee" value={selected} onChange={e => { setSelected(e.target.value) }}>
                            <option value={0} key={0}>Overview</option>
                            {employees.map((employee) => {
                                return <option value={employee.id} key={employee.id}>{employee.name}</option>
                            })}
                        </select>
                        <button className="block text-md w-7 p-1 mr-2 text-cool-grey-900 rounded hover:bg-cool-grey-100 focus:outline-cool-grey-500 transition-colors" onClick={ () => {
                            let next_employee = employees.find((e) => e.id > selected );
                            if (next_employee == undefined) setSelected(0);
                            else setSelected(next_employee.id);
                        } }>Next</button>
                    </div>
                </div>

            </div>

            {/* EMPLOYEE DATA */}
            <div className="p-6 m-3 w-16 border-t-cyan-800 border-t-8 mb-12 rounded bg-cool-grey-50 shadow-lg">
                {employees.find((employee) => employee.id == selected ) != undefined && 
                <EmployeeData   employee={employees.find((employee) => employee.id == selected )} 
                                data={changedClock.filter((entry) => selected == entry.id )} 
                                deleteTime={deleteTime} 
                                addTime={addTime} 
                                setBreak={setBreak}
                                start={start}
                                end={end} />}
                {selected == 0 && <Overview employees={employees} data={changedClock} start={start} end={end} />}
            </div>

        </div>
    </>);
}

function Overview ( { employees, data, start, end } ) {

    return <>
        <h3 className="font-sans text-xl font-semibold text-cool-grey-900">Employees</h3>
        <div className="mt-3">
            {
                employees.map((employee) => {
                    return <li key={employee.id} className="list-none leading-5 pb-2 pl-2">
                        <div className="font-semibold text-lg text-cool-grey-900">{employee.name}</div>
                        <div className="pl-2 text-cool-grey-800">{findHours( { data: data.filter((entry) => { return entry.id == employee.id && !entry.deleted }) } )}</div>
                    </li>;
                })
            }
        </div>
    </>

}

function EmployeeData ( {employee, data, deleteTime, addTime, setBreak, start, end} ) {

    useEffect(() => {

    }, [employee, data])

    const [ datetime, setDatetime ] = useState("");

    const timeclockRows = [];

    let gap = 0;

    let first, second;

    let clockinRow = [];

    for (let i = 0; i < data.length; i++) {

        let clockin = data[i];

        clockinRow.push(<p 
                    className={`${ "cursor-pointer mb-1 text-cool-grey-900" }
                            ${ clockin.deleted && "line-through"}
                            ${ clockin.created && "font-bold"} `}
                    key={clockin.unique}
                    onClick={() => {
                            deleteTime(clockin.id, clockin.unique);
                            console.log(clockin.unique);
                        }
                    }>
                        {moment(clockin.date + ' ' + clockin.time).format('M/DD/YY - h:mm A')}
                </p>)

        if (!clockin.deleted) {

            gap++;

            if (gap % 2 == 1) {

                first = new Date(clockin.date + ' ' + clockin.time);

            } else {

                second = new Date(clockin.date + ' ' + clockin.time);

                let length = (second - first) / (1000 * 60 * 60);

                if (clockin.hasBreak) length -= 0.5;

                let hours = Math.floor(length);
                let minutes = Math.floor(60 * (length % 1));

                if (minutes < 0 || hours < 0) {
                    minutes = 0;
                    hours = 0;
                }

                timeclockRows.push(
                    <div className="w-12 h-fit mb-5">
                        <p className="font-semibold text-lg">{`${hours} ${hours != 1 ? "hours" : "hour"}, ${minutes} ${minutes != 1 ? "minutes" : "minute"}`}</p>
                        {clockinRow}
                        <div className="flex mt-2">
                            <input id={clockin.unique + "break"} className="accent-cyan-800 w-4 h-4" type='checkbox' checked={clockin.hasBreak} onChange={(e) => setBreak(clockin.unique, e.target.checked)}/>
                            <label for={clockin.unique + "break"} className="pl-1 text-gray-600 text-md leading-4"> Break</label>
                        </div>
                    </div>
                );

                clockinRow = [];

            }
        }
        
        if (i + 1 == data.length && clockinRow.length != 0) {

            timeclockRows.push(
                <div className="w-12 h-fit mb-5">
                    <p className="font-semibold text-lg">Incomplete Shift</p>
                    {clockinRow}
                </div>
            );

        }

    }

    return <>
        <div className="flex">
            <div className="w-96 font-sans">
                <h3 className="font-sans text-xl font-semibold text-cool-grey-900 mb-4">{employee.name} (ID {employee.id}, Shift {employee.shift})</h3>
                <input className="w-12 h-6 p-2 mr-2 mb-5 text-md text-cool-grey-900 bg-cool-grey-100 border border-cyan-800 shadow-md focus:outline-cool-grey-500 rounded" type="datetime-local" onChange={(e) => setDatetime(e.target.value)} />
                <button className="text-md w-7 h-6 p-1 mr-2 text-cool-grey-900 rounded hover:bg-cool-grey-100 focus:outline-cool-grey-500 transition-colors" onClick={(e) => addTime(employee.id, datetime)}>Add</button>
                <div>{timeclockRows}</div>
            </div>
            <div className="text-cool-grey-900">
                {/* <h3 className="font-sans text-xl font-semibold text-cool-grey-900 mb-4">Results</h3> */}
                <p className="whitespace-pre font-Courier">
                    <span className="font-bold">Total:</span> {findHours({data: data.filter((entry) => !entry.deleted)})} <br/><br/>
                    {generateGraphic({data: data.filter((entry) => !entry.deleted), start, end})}
                </p>
            </div>
        </div>
    </>

}

function getClock (data, start, end, employees) {

    let newClock = [];

    let unique = 0;

    let lines = data.split('\n');

    let last = {};

    for (var i = 0; i < lines.length; i++){
            
        if (lines[i][0] != '#' && lines[i].length > 1) {
            
            try {

                let values = lines[i].split(/(\s)/).filter((x) => x.trim().length>0);

                let ID = values[0];
                let date = values[1];
                let time = values[2];

                let employee = employees.find((e) => e.id == ID);

                let double = false;
                let hasBreak = false;

                if (last[ID] != undefined) {
                    double = ((new Date(date + ' ' + time) - last[ID]) / 1000) < 60;
                    if (employee != undefined && employee.shift == 1) hasBreak = ((new Date(date + ' ' + time) - last[ID]) / (1000 * 60)) > 360;
                }
                
                
                last[ID] = new Date(date + ' ' + time);

                let clockin = {unique: unique, id: ID, date: date, time: time, deleted: double, created: false, hasBreak: hasBreak};

                if (start <= date && date <= end) {
                    newClock.push(clockin);
                    unique++;
                }

            } catch (e) { }

        }

    }

    return newClock;

}

function applyChanges ( clock, changes ) {

    let changedClock = [...clock];

    for (let i = 0; i < changes.length; i++) {

        let change = changes[i];

        if (change.type == "create") {

            if (!change.deleted) changedClock.push({unique: change.unique, id: change.id, date: change.date, time: change.time, deleted: change.deleted, created: change.created, hasBreak: change.hasBreak});

        } else if (change.type == "update") {

            let match = changedClock.find((clockin) => change.unique == clockin.unique);

            if (match != undefined) {
                if (change.deleted != undefined) match.deleted = change.deleted;
                if (change.hasBreak != undefined) match.hasBreak = change.hasBreak;
            }

        }

    }

    changedClock.sort((a, b) => {

        return new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time);

    })

    return changedClock;

}

function findHours( { data } ) {

    let total_hours = 0;

    for (let i = 0; i < data.length - 1; i += 2) {

        let first = data[i];
        let second = data[i + 1];

        let start_time = new Date(first.date + ' ' + first.time);
        let end_time = new Date(second.date + ' ' + second.time);

        let length = (end_time - start_time) / (1000 * 60 * 60);

        if (second.hasBreak) length -= 0.5;

        total_hours += length;

    }

    let hours = Math.floor(total_hours);
    let minutes = Math.floor(60 * (total_hours % 1));

    let output = `${hours} ${hours != 1 ? "hours" : "hour"}, ${minutes} ${minutes != 1 ? "minutes" : "minute"}`

    return output;

}

function findHoursRange( { data, start, end } ) {

    let total_hours = 0;

    data = data.filter((datum) => {
        console.log(moment(datum.timestamp).format('MM/DD/YYYY hh:mm:ss a'));
        return (moment(datum.date + ' ' + datum.time).isBetween(moment(start), moment(end)));
    })

    for (let i = 0; i < data.length - 1; i += 2) {

        let first = data[i];
        let second = data[i + 1];

        let start_time = new Date(first.date + ' ' + first.time);
        let end_time = new Date(second.date + ' ' + second.time);

        let length = (end_time - start_time) / (1000 * 60 * 60);

        if (second.hasBreak) length -= 0.5;

        total_hours += length;

    }

    let hours = Math.floor(total_hours);
    let minutes = Math.floor(60 * (total_hours % 1));

    let output = `${hours} ${hours != 1 ? "hours" : "hour"}, ${minutes} ${minutes != 1 ? "minutes" : "minute"}`

    return output;

}

function generateGraphic( { data, start, end } ) {

    let graphic = [];

    let size = moment.duration(moment(end).diff(moment(start))).as('days') + 1;

    for (let i = 0; i < size; i++) {
        for (let z = 0; z < 24; z++) graphic.push('·');
    }

    for (let i = 0; i < data.length - 1; i += 2) {

        let first = data[i];
        let second = data[i + 1];

        let start_time = new Date(first.date + ' ' + first.time);
        let end_time = new Date(second.date + ' ' + second.time);

        let first_duration = Math.floor(moment.duration(moment(start_time).diff(moment(start))).as('hours'));
        let second_duration = Math.floor(moment.duration(moment(end_time).diff(moment(start))).as('hours'));

        if (first_duration < 0) first_duration = -1;
        if (second_duration >= size * 24) second_duration = size * 24;

        if (graphic[first_duration] == '·') graphic[first_duration] = '[';
        else graphic[first_duration] = '|';

        if (graphic[second_duration] == '·') graphic[second_duration] = ']';
        else graphic[second_duration] = '|';

        for (let i = first_duration + 1; i < second_duration; i++) {
            graphic[i] = '$';
        }

    }

    if (data.length % 2 == 1) {
        let first = data[data.length - 1];

        let start_time = new Date(first.date + ' ' + first.time);

        let first_duration = Math.floor(moment.duration(moment(start_time).diff(moment(start))).as('hours'));

        if (first_duration < 0) first_duration = -1;

        graphic[first_duration] = '?';

        for (let i = first_duration + 1; i < size * 24; i++) {
            graphic[i] = '?';
        }
    }

    let output = "";

    for (let i = 0; i < size; i++) {
        output += moment(start).add(i, 'day').format('MM/DD dd:');
        output += '|';
        for (let z = 0; z < 24; z++) output += graphic[(i * 24) + z];
        output += '|\n';
        if (i % 7 == 6) {
            let week_start = moment(start).add(i, 'day').add(-6, 'day').format('MM/DD/YYYY [12:00 AM]');
            let week_end = moment(start).add(i, 'day').format('MM/DD/YYYY [11:59 PM]');
            output += findHoursRange({data, start: week_start, end: week_end}) + '\n';
            output += '\n';
        }
    }

    return output;

}