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
        <div class="bg-slate-100 shadow-lg rounded-md w-96 h-64">
            <div class="text-xl font-sans font-semibold pl-3 pt-2">ER2</div>
            <div class="text-md font-sans pl-4">Evnroll</div>
        </div>
    </div>
    );
}

// The menu bar component.
function Menu() {

    return <h1>Origin Golf Machine Shop</h1>

}
