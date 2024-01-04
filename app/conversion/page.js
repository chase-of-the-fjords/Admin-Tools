// This is an interactive component, so it's a client component.
'use client'

import React, { useState, useEffect } from "react";

import Link from "next/link";

/**
 * The default export for the view page.
 * 
 * @returns JSX representation of the edit page.
 */
export default function App() {

    let [input, setInput] = useState("");
    let [output, setOutput] = useState("");

    let [conversion, setConversion] = useState("");

    let [fileName, setFileName] = useState("output.txt");

    const saveFile = async (blob, suggestedName) => {
        // Feature detection. The API needs to be supported
        // and the app not run in an iframe.
        const supportsFileSystemAccess =
          'showSaveFilePicker' in window &&
          (() => {
            try {
              return window.self === window.top;
            } catch {
              return false;
            }
          })();
        // If the File System Access API is supported…
        if (supportsFileSystemAccess) {
          try {
            // Show the file save dialog.
            const handle = await showSaveFilePicker({
              suggestedName,
              types: [
                {
                    description: "Text file",
                    accept: { "text/plain": [".txt", ".min", ".nc"] }
                },
              ]
            });
            // Write the blob to the file.
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return;
          } catch (err) {
            // Fail silently if the user has simply canceled the dialog.
            if (err.name !== 'AbortError') {
              console.error(err.name, err.message);
            }
            return;
          }
        }
        // Fallback if the File System Access API is not supported…
        // Create the blob URL.
        const blobURL = URL.createObjectURL(blob);
        // Create the `<a download>` element and append it invisibly.
        const a = document.createElement('a');
        a.href = blobURL;
        a.download = "output.txt";
        a.style.display = 'none';
        document.body.append(a);
        // Programmatically click the element.
        a.click();
        // Revoke the blob URL and remove the element.
        setTimeout(() => {
          URL.revokeObjectURL(blobURL);
          a.remove();
        }, 1000);
      };

      async function getInputData(e) {

        e.preventDefault()
        const reader = new FileReader()
        setFileName(e.target.files[0].name)
        reader.onload = async (e) => { 
            const text = (e.target.result)
            setInput(text);
        };
        if (Array.from(e.target.files).length > 0) reader.readAsText(e.target.files[0])

    }

    return <>
        {/* HEADER */}
        <div className="fixed top-0 w-screen m-auto shadow-xl h-7 bg-cool-grey-50">
            <h1 className="absolute w-full text-xl font-semibold text-center sm:text-2xl bottom-3 sm:bottom-2 text-cool-grey-900">Conversion Tool</h1>
            {/* <Link className="absolute cursor-pointer text-cool-grey-500 hover:text-cool-grey-700 bottom-3 sm:bottom-2 left-3" href="./">Home</Link> */}
            <Link href="./" className="absolute top-3 sm:top-2 left-3 sm:left-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 sm:w-6">
                    <path className="fill-cool-grey-300" d="M9 22H5a1 1 0 0 1-1-1V11l8-8 8 8v10a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v4a1 1 0 0 1-1 1zm3-9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
                    <path className="fill-cyan-800" d="M12.01 4.42l-8.3 8.3a1 1 0 1 1-1.42-1.41l9.02-9.02a1 1 0 0 1 1.41 0l8.99 9.02a1 1 0 0 1-1.42 1.41l-8.28-8.3z"/>
                </svg>
            </Link>
        </div>

        <div className="block m-auto mt-4 w-fit h-fit">
            <div className="relative block w-full h-6 m-auto mt-8">
                <input type="file" 
                    className="absolute left-0 w-12 mr-4 transition-colors file:w-9 file:cursor-pointer file:border-none file:h-6 file:rounded file:shadow-md file file:bg-cyan-700 file:hover:bg-cyan-800 file:text-cyan-50 file:hover:text-cyan-100"
                    accept=".txt,.text,.nc,.min"
                    onInput={(e) => getInputData(e)}
                    />
                <button className="absolute right-0 h-6 ml-4 transition-colors rounded shadow-md w-9 bg-cyan-700 hover:bg-cyan-800 text-cyan-50 hover:text-cyan-100"
                    onClick={() => {
                        saveFile(new Blob([output], { type: 'text/plain' }), fileName)
                    }}>
                    Save File
                </button>
                <div className="h-6 mx-auto w-fit">
                    <select className="w-12 h-6 font-semibold text-center rounded shadow-md bg-cool-grey-50" onChange={(e) => setConversion(e.target.value)} value={conversion}>
                        <option value=""></option>
                        <option value="keep">No Change</option>
                        <option value="sign-switch">Switch Signs</option>
                        <option value="haas-to-okuma">Haas to Okuma</option>
                        <option value="okuma-to-haas">Okuma to Haas</option>
                    </select>
                </div>
            </div>
            <div className="flex items-center justify-center mt-4">
                <textarea className="mr-4 font-mono border-2 rounded shadow-xl resize-none border-cool-grey-400 w-14 h-14" value={input} onChange={(e) => setInput(e.target.value)} />
                <button className="w-8 h-8 align-middle transition-colors rounded-md shadow-md bg-cyan-700 fill-cyan-50 hover:bg-cyan-800 hover:fill-cyan-100"
                    onClick={() => {
                        setInput(output)
                        setOutput("")
                        setConversion("")
                    }}>
                    <svg className="mx-auto" xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48">
                        <path d="M400-240 160-480l240-240 56 58-142 142h486v80H314l142 142-56 58Z"/>
                    </svg>
                </button>
                <OutputBox conversion={conversion} input={input} output={output} setOutput={setOutput} />
            </div>
        </div>
    </>

}

function OutputBox( { conversion, input, output, setOutput } ) {

    useEffect(() => {
        if (conversion == 'keep') setOutput(keepValue(input));
        if (conversion == 'sign-switch') setOutput(signSwitch(input));
        if (conversion == 'haas-to-okuma') setOutput(haasToOkuma(input));
        if (conversion == 'okuma-to-haas') setOutput(okumaToHaas(input));
    }, [conversion, input])

    return <textarea className="ml-4 font-mono border-2 rounded shadow-xl resize-none border-cool-grey-400 w-14 h-14" value={output} onChange={(e) => setOutput(e.target.value)}>
                
    </textarea>

}

function keepValue(input) {
    
    let output = "";

    for (let i = 0; i < input.length; i++) {
        output += input[i];
    }

    return output;

}

function signSwitch(input) {
    
    let output = "";

    for (let i = 0; i < input.length; i++) {

        let c = input[i];

        output += c;

        if (c == '(') {

            while (i + 1 < input.length && c != ')' && c != '\n') {
                i++
                c = input[i]
                output += c
            }

        } else if (c == 'X' || c == 'Y' || c == 'I' || c == 'J' ||
            c == 'x' || c == 'y' || c == 'i' || c == 'j') {
            
            if (i < input.length - 1) {

                if (input[i + 1] == '-') {

                    i++;

                } else {

                    output += '-';

                }

            } else {

                output += '-'

            }

        }
    }

    return output;

}

// Rules:
// - Ignore anything within parentheses
// - G43 -> G56
// - Remove every G91 G28 Z0
// - T## M06 -> G116 T## and T# M06 -> G116 T0#
// - M06 T## -> G116 T## and M06 T# -> G116 T0#

function haasToOkuma(input) {

    let output = "";

    let lines = input.split('\n');

    for (let l = 0; l < lines.length; l++) {

        let line = lines[l]

        let whitespaceStripped = line.replaceAll(' ', '')

        // Remove lines that say G91G28Z0, if whitespace is removed
        if (whitespaceStripped.toLocaleUpperCase() == 'G91G28Z0') continue;

        for (let i = 0; i < line.length; i++) {

            let c = line[i];

            hto_chars:
            // Parentheses
            if (c == '(') {

                output += c;

                while (i + 1 < line.length && c != ')') {
                    i++;
                    c = line[i];
                    output += c;
                }
    
            } else if (c == 'G' || c == 'g') {

                // G43 -> G56

                try {

                    let tool = line.substring(i, i + 3);

                    if (tool.toLocaleUpperCase() == 'G43') {

                        output += 'G56';
                        i += 2;
                        break hto_chars;

                    }

                } catch (e) { }

                // remove G91 G28 Z0

                try {

                    let tool = line.substring(i, i + 10);

                    if (tool.toLocaleUpperCase() == 'G91 G28 Z0') {
                        
                        i += 9;
                        if (i + 1 < line.length && line[i + 1] == ' ') i++;
                        break hto_chars;

                    }

                } catch (e) { }

                output += c;

            } else if (c == 'T' || c == 't') {

                // T## M06 -> G116 T##

                try {

                    let command = line.substring(i + 3, i + 7);

                    let number = parseInt(line.substring(i + 1, i + 3))

                    if (command.toLocaleUpperCase() == ' M06' && !isNaN(number)) {

                        output += 'G116 T' + line.substring(i + 1, i + 3);
                        i += 6;
                        break hto_chars;

                    }

                } catch (e) { }

                // T# M06 -> G116 T#

                try {

                    let command = line.substring(i + 2, i + 6);

                    let number = parseInt(line[i + 1])

                    if (command.toLocaleUpperCase() == ' M06' && !isNaN(number)) {

                        output += 'G116 T0' + number;
                        i += 5;
                        break hto_chars;

                    }

                } catch (e) { }

                output += c;

            } else if (c == 'M' || c == 'm') {

                // M06 T## -> G116 T##

                try {

                    let command = line.substring(i, i + 5);

                    let digit1 = parseInt(line[i + 5])
                    let digit2 = parseInt(line[i + 6])

                    if (command.toLocaleUpperCase() == 'M06 T' && !isNaN(digit1) && !isNaN(digit2)) {

                        output += 'G116 T' + line.substring(i + 5, i + 7);
                        i += 6;
                        break hto_chars;

                    }

                } catch (e) { }

                // M06 T# -> G116 T0#

                try {

                    let command = line.substring(i, i + 5);

                    let number = parseInt(line[i + 5])

                    if (command.toLocaleUpperCase() == 'M06 T' && !isNaN(number)) {

                        output += 'G116 T0' + number;
                        i += 5;
                        break hto_chars;

                    }

                } catch (e) { }

                output += c;

            } else {

                output += c;

            }

        }

        if (l + 1 < lines.length) output += '\n';

    }

    return output;

}

// Rules:
// - Ignore anything within parentheses
// - G56 -> G43
// - G116 T## -> T## M06 and G116 T# -> T0# M06

function okumaToHaas(input) {

    let output = "";

    let lines = input.split('\n');

    for (let l = 0; l < lines.length; l++) {

        let line = lines[l]

        for (let i = 0; i < line.length; i++) {

            let c = line[i];

            hto_chars:
            // Parentheses
            if (c == '(') {

                output += c;

                while (i + 1 < line.length && c != ')') {
                    i++;
                    c = line[i];
                    output += c;
                }
    
            } else if (c == 'G' || c == 'g') {

                // G56 -> G43

                try {

                    let tool = line.substring(i, i + 3);

                    if (tool.toLocaleUpperCase() == 'G56') {

                        output += 'G43';
                        i += 2;
                        break hto_chars;

                    }

                } catch (e) { }

                // G116 T## -> T## M06

                try {

                    let command = line.substring(i, i + 6);

                    let digit1 = parseInt(line[i + 6])
                    let digit2 = parseInt(line[i + 7])

                    if (command.toLocaleUpperCase() == 'G116 T' && !isNaN(digit1) && !isNaN(digit2)) {

                        output += 'T' + digit1 + digit2 + " M06";
                        i += 7;
                        break hto_chars;

                    }

                } catch (e) { }

                // G116 T# -> T0# M06

                try {

                    let command = line.substring(i, i + 6);

                    let digit = parseInt(line[i + 6])

                    if (command.toLocaleUpperCase() == 'G116 T' && !isNaN(digit)) {

                        output += 'T0' + digit + " M06";
                        i += 6;
                        break hto_chars;

                    }

                } catch (e) { }

                output += c;

            } else {

                output += c;

            }

        }

        if (l + 1 < lines.length) output += '\n';

    }

    return output;

}