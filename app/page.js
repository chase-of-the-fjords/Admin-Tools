// This is an interactive component, so it's a client component.
"use client";

import Link from "next/link";
import { ReactElement } from "react";

/**
 * The default export for the edit page.
 *
 * @returns JSX representation of the edit page.
 */
function App() {
  let link_style =
    "text-cyan-700 hover:text-cyan-900 transition-colors block w-fit";

  // JSX (RETURN VALUE)

  return (
    <>
      {/* HEADER */}
      <Menu />

      <div className="max-w-[280px] sm:max-w-[540px] min-[840px]:max-w-[800px] mx-auto mt-9">
        <h3 className="mb-3 ml-6 text-2xl font-semibold">Machine Shop</h3>

        <div className="flex flex-wrap gap-[20px] p-[20px] rounded-lg shadow-inner bg-cool-grey-200">
          <Card
            text="Shop Display"
            description="The main display page for the machine shop."
            link="http://shop.origingolf.com"
          />
          <Card
            text="Edit Shop"
            description="The management tool for the machine shop."
            link="http://shop.origingolf.com/edit"
          />
          <Card
            text="History Log"
            description="The history of all activity in the shop."
            link="http://shop.origingolf.com/history"
          />
          <Card
            text="Moment History"
            description="Shows the state of the machine shop at any given point in time."
            link="http://shop.origingolf.com/moment"
          />
        </div>
      </div>

      <div className="max-w-[280px] sm:max-w-[540px] min-[840px]:max-w-[800px] mx-auto mt-6 mb-6">
        <h3 className="mb-3 ml-6 text-2xl font-semibold">Admin Tools</h3>

        <div className="flex flex-wrap gap-[20px] p-[20px] rounded-lg shadow-inner bg-cool-grey-200">
          <Card
            text="Timeclock"
            description="Input and calculate hours for each pay period."
            link="./timeclock"
          />
          <Card
            text="Conversion Tool"
            description="Convert machine code using various functions."
            link="./conversion"
          />
        </div>
      </div>
    </>
  );
}

// The menu bar component.
function Menu() {
  return (
    <div className="fixed top-0 z-10 w-screen h-8 m-auto shadow-xl bg-cool-grey-50">
      <div className="mx-auto w-fit">
        <Link href="./">
          <img src="./inverted-logo.png" className="pr-3 mx-auto mt-2 h-7" />
        </Link>
      </div>
    </div>
  );
}

function Card({ text, description, link }) {
  return (
    <div className="w-fit font-inter">
      <Link href={link}>
        <div className="w-12 h-10 transition-all border-t-8 rounded-lg shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-1 bg-cool-grey-50 border-t-cyan-800">
          <div className="mt-2 ml-4">
            <h3 className="text-xl font-semibold text-cyan-800">{text}</h3>
            <p className="mt-1 mr-4 leading-5">{description}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default App;
