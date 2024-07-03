// This is an interactive component, so it's a client component.
"use client";

// Basic React hooks.
import { useState, useEffect } from "react";

import Link from "next/link";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ClusterHeading from "./components/ClusterHeading";

import { getLog } from "./Helpers/Interface";
import Action from "./components/Action";

import moment from "moment";

/**
 * The default export for the history page.
 *
 * @returns JSX representation of the history page.
 */
export default function App() {
	// JSX (RETURN VALUE)

	return (
		<>
			{/* BACKGROUND */}
			<div className="bg-cool-grey-100 -z-10 fixed top-0 left-0 w-full h-[150%]"></div>

			<Menu />

			<History />
		</>
	);
}

// The menu bar component.
function Menu() {
	const [show, setShow] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);

	const controlNavbar = () => {
		if (window.scrollY > lastScrollY && window.scrollY > 150) {
			// if scroll down hide the navbar
			setShow(false);
		} else {
			// if scroll up show the navbar
			setShow(true);
		}

		// remember current page location to use in the next move
		setLastScrollY(window.scrollY);
	};

	useEffect(() => {
		window.addEventListener("scroll", controlNavbar);

		// cleanup function
		return () => {
			window.removeEventListener("scroll", controlNavbar);
		};
	}, [lastScrollY]);

	return (
		<>
			<div className="invisible h-16 font-RobotoMono" />
			<div
				className={`fixed z-50 w-screen h-16 m-auto shadow-xl bg-cool-grey-50 transition-[top] ${
					show ? "top-0" : "-top-20"
				}`}
			>
				<div className="relative max-w-[1000px] mx-auto">
					<div className="absolute invisible w-full mx-auto mt-1 text-lg font-semibold text-center sm:visible top-4">
						Order History
					</div>
					<Link
						href="/"
						className="absolute mt-2 ml-4 cursor-pointer w-fit h-fit"
					>
						<img src="../../inverted-logo.png" className="h-12" />
					</Link>

					<div>
						<DropdownMenu>
							<DropdownMenuTrigger className="absolute mt-1 mr-8 font-semibold transition-colors cursor-pointer right-1 top-4 hover:text-cool-grey-900 text-cool-grey-500">
								Menu
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<Link href="/orders">
									<DropdownMenuItem>View Orders</DropdownMenuItem>
								</Link>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>
		</>
	);
}

function History() {
	const [log, setLog] = useState([]);
	const [loading, setLoading] = useState(true);

	const [start, setStart] = useState(
		new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString("sv")
	);
	const [end, setEnd] = useState(new Date(Date.now()).toLocaleDateString("sv"));
	const [filter, setFilter] = useState("");

	useEffect(() => {
		async function fetchData() {
			setLog([]);
			setLog(await getLog(start, end, filter));
			setLoading(false);
		}
		if (loading) fetchData();
	}, [loading]);

	return (
		<div className="xl:overflow-x-hidden">
			<div className="xl:w-screen">
				<div className="flex max-w-[1200px] flex-col md:flex-row mx-auto my-3 sm:my-6 space-y-3 sm:space-y-6 md:space-y-0 md:space-x-6 px-3 sm:px-6">
					<Filter
						setStart={setStart}
						setEnd={setEnd}
						setFilter={setFilter}
						setLoading={setLoading}
					/>
					<Log log={log} loading={loading} />
				</div>
			</div>
		</div>
	);
}

function Filter({ setStart, setEnd, setFilter, setLoading }) {
	return (
		<div className="w-full p-4 rounded-md shadow-lg sm:w-96 sm:mx-auto sm:p-6 md:w-64 h-fit bg-cool-grey-50">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					setLoading(true);
				}}
				className="w-full"
			>
				<div className="mb-4">
					<h2 className="mb-1 ml-1 text-xl font-medium font-Poppins">
						Start Date
					</h2>
					<input
						type="date"
						className="block w-full px-2 py-1 rounded-md bg-cool-grey-100 text-md focus:outline-2 focus:outline-yellow-500"
						defaultValue={new Date(
							Date.now() - 7 * 24 * 60 * 60 * 1000
						).toLocaleDateString("sv")}
						onChange={(e) => {
							setStart(e.target.value);
						}}
					/>
				</div>
				<div className="mb-4">
					<h2 className="mb-1 ml-1 text-xl font-medium font-Poppins">
						End Date
					</h2>
					<input
						type="date"
						className="block w-full px-2 py-1 rounded-md bg-cool-grey-100 text-md focus:outline-2 focus:outline-yellow-500"
						defaultValue={new Date(Date.now()).toLocaleDateString("sv")}
						onChange={(e) => {
							setEnd(e.target.value);
						}}
					/>
				</div>
				{/* <div className="mb-4">
					<h2 className="mb-1 ml-1 text-xl font-medium font-Poppins">Filter</h2>
					<input
						className="block w-full px-2 py-1 transition-all rounded-md text-md bg-cool-grey-100 focus:outline-2 focus:outline-yellow-500"
						type="text"
						onChange={(e) => {
							setFilter(e.target.value);
						}}
						placeholder="Search"
					/>
				</div> */}
				<button
					className="block px-2 py-1 mx-auto mt-8 font-medium transition-colors bg-yellow-300 rounded-md hover:bg-yellow-400 font-Poppins text-md focus:outline-2 focus:outline-yellow-500"
					type="submit"
				>
					Submit
				</button>
			</form>
		</div>
	);
}

function Log({ log, loading }) {
	if (loading)
		return (
			<div className="flex-grow p-4 sm:min-w-[480px] rounded-md shadow-lg sm:p-6 h-fit bg-cool-grey-50">
				<div className="mx-auto text-xl font-semibold sm:mx-0 w-fit font-Poppins animate-pulse">
					Generating History...
				</div>
			</div>
		);
	else if (log.length == 0)
		return (
			<div className="flex-grow p-4 sm:min-w-[480px] rounded-md shadow-lg sm:p-6 h-fit bg-cool-grey-50">
				<div className="mx-auto text-xl font-semibold sm:mx-0 w-fit font-Poppins">
					No Results
				</div>
			</div>
		);

	return (
		<div className="flex-grow p-4 sm:min-w-[480px] rounded-md shadow-lg sm:p-6 h-fit bg-cool-grey-50">
			{log.map((entry) => {
				return (
					<div key={entry.timestamp + entry.user}>
						<ClusterHeading
							name={entry.user}
							date={entry.date}
							time={entry.time}
						/>
						<div className="m-2 sm:m-4">
							<div className="mb-4 text-lg font-Poppins text-cool-grey-900">
								<Action action={entry} />
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
