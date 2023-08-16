// This is an interactive component, so it's a client component.
'use client'

import Link from 'next/link';

/**
 * The default export for the edit page.
 * 
 * @returns JSX representation of the edit page.
 */
export default function App() {

    let link_style = "text-red-700 hover:text-purple-900 transition-colors block";

        // JSX (RETURN VALUE)

    return (<div className="font-sans p-4">
        {/* Main header */}
        <h1 className="text-3xl pb-4">Origin Golf Admin Tools</h1>
        
        {/* List of pages */}
        <div className="pl-4 text-xl">
            <Link className={link_style} href="//shop.origingolf.com">Shop Display</Link>
            <div className="ml-6">
                {[
                    {text: "Edit Shop", link: "//shop.origingolf.com/edit"},
                    {text: "History Log", link: "//shop.origingolf.com/history"},
                    {text: "Moment History", link: "//shop.origingolf.com/moment"},
                ].map((obj) =>
                    {
                        return <Link key={obj.text} className={link_style} href={obj.link}>{obj.text}</Link>
                    }
                )}
            </div>
            <Link className={link_style} href="./timeclock">Timeclock</Link>
            <Link className={link_style} href="//drive.google.com/file/d/1CN_Xb9dpm3dpDMwEbjDmtKG6m7rchUwT/view?usp=drive_link">Conversion Tool</Link>
        </div>
    </div>
    );
}

// The menu bar component.
function Menu() {

    return <h1>Origin Golf Machine Shop</h1>

}
