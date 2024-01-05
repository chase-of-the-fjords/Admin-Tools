// This is an interactive component, so it's a client component.
'use client'

import Link from 'next/link';
import { ReactElement } from 'react';

/**
 * The default export for the edit page.
 * 
 * @returns JSX representation of the edit page.
 */
function App(): ReactElement {

    let link_style: string = "text-cyan-700 hover:text-cyan-900 transition-colors block w-fit";

        // JSX (RETURN VALUE)

    return <>
        {/* HEADER */}
        <Menu />

        {/* FULL PAGE */}
        <div className="font-sans">

            {/* List of pages */}
            <div className="box-content w-12 p-5 m-auto mt-8 text-xl border-t-8 rounded-md shadow-lg border-t-cyan-800 bg-cool-grey-50">
                <Link className={link_style} href="//shop.origingolf.com">Shop Display</Link>
                <div className="mb-2 ml-2">
                    {[
                        {text: "- Edit Shop", link: "//shop.origingolf.com/edit"},
                        {text: "- History Log", link: "//shop.origingolf.com/history"},
                        {text: "- Moment History", link: "//shop.origingolf.com/moment"},
                    ].map((obj) =>
                        {
                            return <Link key={obj.text} className={link_style} href={obj.link}>{obj.text}</Link>
                        }
                    )}
                </div>
                <Link className={`${link_style} mb-2`} href="./timeclock">Timeclock</Link>
                <Link className={`${link_style} mb-2`} href="./conversion">Conversion Tool</Link>
            </div>

        </div>
    </>;
}

// The menu bar component.
function Menu () {

    return (<div className="fixed top-0 w-screen m-auto shadow-xl h-7 bg-cool-grey-50">
        <h1 className="absolute w-full text-xl font-semibold text-center sm:text-2xl bottom-3 sm:bottom-2 text-cool-grey-900">Admin Tools</h1>
    </div>);

}

export default App;