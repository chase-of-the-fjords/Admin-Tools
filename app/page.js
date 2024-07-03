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
        <h3 className="mb-3 ml-6 text-2xl font-semibold font-Poppins">
          Machine Shop
        </h3>

        <div className="flex flex-wrap gap-[20px] p-[20px] rounded-lg shadow-inner bg-cool-grey-200">
          <Card
            text="Shop Display"
            description="The main display page for the machine shop. Log in to edit."
            link="http://shop.origingolf.com"
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
          <Card
            text="View Orders"
            description="View all active orders in the shop and their information."
            link="./orders"
          />
          <Card
            text="Order History"
            description="The history of all activity on the orders page."
            link="./orders/history"
          />
        </div>
      </div>

      <div className="max-w-[280px] sm:max-w-[540px] min-[840px]:max-w-[800px] mx-auto mt-6 mb-6">
        <h3 className="mb-3 ml-6 text-2xl font-semibold font-Poppins">
          Admin Tools
        </h3>

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
        <div className="relative w-12 h-10 overflow-hidden transition-all border-t-8 rounded-lg shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-1 bg-cool-grey-50 border-t-cyan-800">
          <svg
              viewBox="0 0 45.973 45.973"
              className={`absolute w-12 h-12 fill-cool-grey-100 -left-8 -bottom-10 animate-[spin_12s_linear_infinite] transition-colors`}
            >
            <g>
              <g>
                <path
                  d="M43.454,18.443h-2.437c-0.453-1.766-1.16-3.42-2.082-4.933l1.752-1.756c0.473-0.473,0.733-1.104,0.733-1.774
        c0-0.669-0.262-1.301-0.733-1.773l-2.92-2.917c-0.947-0.948-2.602-0.947-3.545-0.001l-1.826,1.815
        C30.9,6.232,29.296,5.56,27.529,5.128V2.52c0-1.383-1.105-2.52-2.488-2.52h-4.128c-1.383,0-2.471,1.137-2.471,2.52v2.607
        c-1.766,0.431-3.38,1.104-4.878,1.977l-1.825-1.815c-0.946-0.948-2.602-0.947-3.551-0.001L5.27,8.205
        C4.802,8.672,4.535,9.318,4.535,9.978c0,0.669,0.259,1.299,0.733,1.772l1.752,1.76c-0.921,1.513-1.629,3.167-2.081,4.933H2.501
        C1.117,18.443,0,19.555,0,20.935v4.125c0,1.384,1.117,2.471,2.501,2.471h2.438c0.452,1.766,1.159,3.43,2.079,4.943l-1.752,1.763
        c-0.474,0.473-0.734,1.106-0.734,1.776s0.261,1.303,0.734,1.776l2.92,2.919c0.474,0.473,1.103,0.733,1.772,0.733
        s1.299-0.261,1.773-0.733l1.833-1.816c1.498,0.873,3.112,1.545,4.878,1.978v2.604c0,1.383,1.088,2.498,2.471,2.498h4.128
        c1.383,0,2.488-1.115,2.488-2.498v-2.605c1.767-0.432,3.371-1.104,4.869-1.977l1.817,1.812c0.474,0.475,1.104,0.735,1.775,0.735
        c0.67,0,1.301-0.261,1.774-0.733l2.92-2.917c0.473-0.472,0.732-1.103,0.734-1.772c0-0.67-0.262-1.299-0.734-1.773l-1.75-1.77
        c0.92-1.514,1.627-3.179,2.08-4.943h2.438c1.383,0,2.52-1.087,2.52-2.471v-4.125C45.973,19.555,44.837,18.443,43.454,18.443z
        M22.976,30.85c-4.378,0-7.928-3.517-7.928-7.852c0-4.338,3.55-7.85,7.928-7.85c4.379,0,7.931,3.512,7.931,7.85
        C30.906,27.334,27.355,30.85,22.976,30.85z"
                />
              </g>
            </g>
          </svg>
          <div className="absolute mt-2 ml-4 font-Poppins">
            <h3 className="text-xl font-semibold text-cyan-800">{text}</h3>
            <p className="mt-1 mr-4 leading-5">{description}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default App;
