// This is an interactive component, so it's a client component.
"use client";

import React, { useState, useEffect } from "react";

import Link from "next/link";

const tools = [
  {
    name: "Switch Signs",
    tool_id: "sign-switch",
    func: signSwitch,
  },
  {
    name: "Haas to Okuma",
    tool_id: "haas-to-okuma",
    func: haasToOkuma,
  },
  {
    name: "Okuma to Haas",
    tool_id: "okuma-to-haas",
    func: okumaToHaas,
  },
  {
    name: "Find Lowest Zs",
    tool_id: "find-lowest-zs",
    func: findLowestZs,
  },
  {
    name: "Grab Tools",
    tool_id: "grab-tools",
    func: grabTools,
  },
  {
    name: "Set New Zs",
    tool_id: "set-new-zs",
    func: setNewZs,
  },
  {
    name: "Add New Zs",
    tool_id: "add-new-zs",
    func: addNewZs,
  },
  {
    name: "Remove Sequence Numbers",
    tool_id: "remove-numbers",
    func: removeSequenceNumbers,
  },
  {
    name: "Do Nothing",
    tool_id: "keep",
    func: keepValue,
  },
  {
    name: "Add Decimals",
    tool_id: "add-decimals",
    func: addDecimals,
  },
];

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
      "showSaveFilePicker" in window &&
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
              accept: { "text/plain": [".txt", ".min", ".nc"] },
            },
          ],
        });
        // Write the blob to the file.
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (err) {
        // Fail silently if the user has simply canceled the dialog.
        if (err.name !== "AbortError") {
          console.error(err.name, err.message);
        }
        return;
      }
    }
    // Fallback if the File System Access API is not supported…
    // Create the blob URL.
    const blobURL = URL.createObjectURL(blob);
    // Create the `<a download>` element and append it invisibly.
    const a = document.createElement("a");
    a.href = blobURL;
    a.download = "output.txt";
    a.style.display = "none";
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
    if (e.target.files.length > 0) {
      e.preventDefault();
      const reader = new FileReader();
      setFileName(e.target.files[0].name);
      reader.onload = async (e) => {
        const text = e.target.result;
        setInput(text);
      };
      if (Array.from(e.target.files).length > 0)
        reader.readAsText(e.target.files[0]);
    }
  }

  return (
    <>
      <Menu />

      <div className="block w-full px-4 m-auto mt-4 mb-16 sm:w-fit h-fit">
        <div className="relative flex flex-col-reverse w-full m-auto mt-8 xl:block h-fit">
          <div className="h-8 mt-2 xl:mx-auto sm:w-fit">
            <select
              className="w-full h-8 font-semibold text-center rounded shadow-md sm:w-60 bg-cool-grey-50"
              onChange={(e) => setConversion(e.target.value)}
              value={conversion}
            >
              <option key="empty" value=""></option>
              {tools.map((tool) => {
                return (
                  <option key={tool.tool_id} value={tool.tool_id}>
                    {tool.name}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="relative block w-full space-y-2 min-[360px]:space-y-0 xl:absolute xl:top-0 h-fit pointer-events-none">
            <input
              type="file"
              className="mr-4 transition-colors pointer-events-auto w-60 file:w-24 file:cursor-pointer file:border-none file:h-8 file:rounded file:shadow-md file file:bg-cyan-700 file:hover:bg-cyan-800 file:text-cyan-50 file:hover:text-cyan-100"
              accept=".txt,.text,.nc,.min"
              onInput={(e) => getInputData(e)}
            />
            <button
              className="block h-8 transition-colors pointer-events-auto rounded shadow-md min-[360px]:inline-block min-[360px]:absolute min-[360px]:right-0 w-24 bg-cyan-700 hover:bg-cyan-800 text-cyan-50 hover:text-cyan-100"
              onClick={() => {
                saveFile(new Blob([output], { type: "text/plain" }), fileName);
              }}
            >
              Save File
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full mt-4 space-y-4 xl:space-y-0 xl:space-x-4 xl:flex-row">
          <textarea
            className="w-full font-mono border-2 rounded shadow-xl resize-none border-cool-grey-400 sm:w-[480px] h-[480px]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="w-16 h-16 align-middle transition-colors rounded-md shadow-md bg-cyan-700 fill-cyan-50 hover:bg-cyan-800 hover:fill-cyan-100"
            onClick={() => {
              setInput(output);
              setOutput("");
              setConversion("");
            }}
          >
            <svg
              className="mx-auto rotate-90 xl:rotate-0"
              xmlns="http://www.w3.org/2000/svg"
              height="48"
              viewBox="0 -960 960 960"
              width="48"
            >
              <path d="M400-240 160-480l240-240 56 58-142 142h486v80H314l142 142-56 58Z" />
            </svg>
          </button>
          <OutputBox
            conversion={conversion}
            input={input}
            output={output}
            setOutput={setOutput}
          />
        </div>
      </div>
    </>
  );
}

function OutputBox({ conversion, input, output, setOutput }) {
  useEffect(() => {
    tools.forEach((tool) => {
      if (conversion == tool.tool_id) setOutput(tool.func(input));
    });
  }, [conversion, input]);

  return (
    <textarea
      className="w-full font-mono border-2 rounded shadow-xl resize-none border-cool-grey-400 sm:w-[480px] h-[480px]"
      value={output}
      onChange={(e) => setOutput(e.target.value)}
    ></textarea>
  );
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

    if (c == "(") {
      while (i + 1 < input.length && c != ")" && c != "\n") {
        i++;
        c = input[i];
        output += c;
      }
    } else if (
      c == "X" ||
      c == "Y" ||
      c == "I" ||
      c == "J" ||
      c == "x" ||
      c == "y" ||
      c == "i" ||
      c == "j"
    ) {
      if (i < input.length - 1) {
        if (input[i + 1] == "-") {
          i++;
        } else {
          output += "-";
        }
      } else {
        output += "-";
      }
    }
  }

  return output.trim();
}

// Rules:
// - Ignore anything within parentheses
// - G43 -> G56
// - Remove every G91 G28 Z0
// - T## M06 -> G116 T## and T# M06 -> G116 T0#
// - M06 T## -> G116 T## and M06 T# -> G116 T0#

function haasToOkuma(input) {
  let output = "";

  let lines = input.split("\n");

  for (let l = 0; l < lines.length; l++) {
    let line = lines[l];

    let whitespaceStripped = line.replaceAll(" ", "");

    // Remove lines that say G91G28Z0, if whitespace is removed
    if (whitespaceStripped.toLocaleUpperCase() == "G91G28Z0") continue;

    for (let i = 0; i < line.length; i++) {
      let c = line[i];

      // Parentheses
      hto_chars: if (c == "(") {
        output += c;

        while (i + 1 < line.length && c != ")") {
          i++;
          c = line[i];
          output += c;
        }
      } else if (c == "G" || c == "g") {
        // G43 -> G56

        try {
          let tool = line.substring(i, i + 3);

          if (tool.toLocaleUpperCase() == "G43") {
            output += "G56";
            i += 2;
            break hto_chars;
          }
        } catch (e) {}

        // remove G91 G28 Z0

        try {
          let tool = line.substring(i, i + 10);

          if (tool.toLocaleUpperCase() == "G91 G28 Z0") {
            i += 9;
            if (i + 1 < line.length && line[i + 1] == " ") i++;
            break hto_chars;
          }
        } catch (e) {}

        output += c;
      } else if (c == "T" || c == "t") {
        // T## M06 -> G116 T##

        try {
          let command = line.substring(i + 3, i + 7);

          let number = parseInt(line.substring(i + 1, i + 3));

          if (command.toLocaleUpperCase() == " M06" && !isNaN(number)) {
            output += "G116 T" + line.substring(i + 1, i + 3);
            i += 6;
            break hto_chars;
          }
        } catch (e) {}

        // T# M06 -> G116 T#

        try {
          let command = line.substring(i + 2, i + 6);

          let number = parseInt(line[i + 1]);

          if (command.toLocaleUpperCase() == " M06" && !isNaN(number)) {
            output += "G116 T0" + number;
            i += 5;
            break hto_chars;
          }
        } catch (e) {}

        output += c;
      } else if (c == "M" || c == "m") {
        // M06 T## -> G116 T##

        try {
          let command = line.substring(i, i + 5);

          let digit1 = parseInt(line[i + 5]);
          let digit2 = parseInt(line[i + 6]);

          if (
            command.toLocaleUpperCase() == "M06 T" &&
            !isNaN(digit1) &&
            !isNaN(digit2)
          ) {
            output += "G116 T" + line.substring(i + 5, i + 7);
            i += 6;
            break hto_chars;
          }
        } catch (e) {}

        // M06 T# -> G116 T0#

        try {
          let command = line.substring(i, i + 5);

          let number = parseInt(line[i + 5]);

          if (command.toLocaleUpperCase() == "M06 T" && !isNaN(number)) {
            output += "G116 T0" + number;
            i += 5;
            break hto_chars;
          }
        } catch (e) {}

        output += c;
      } else {
        output += c;
      }
    }

    if (l + 1 < lines.length) output += "\n";
  }

  return output.trim();
}

// Rules:
// - Ignore anything within parentheses
// - G56 -> G43
// - G116 T## -> T## M06 and G116 T# -> T0# M06

function okumaToHaas(input) {
  let output = "";

  let lines = input.split("\n");

  for (let l = 0; l < lines.length; l++) {
    let line = lines[l];

    for (let i = 0; i < line.length; i++) {
      let c = line[i];

      // Parentheses
      hto_chars: if (c == "(") {
        output += c;

        while (i + 1 < line.length && c != ")") {
          i++;
          c = line[i];
          output += c;
        }
      } else if (c == "G" || c == "g") {
        // G56 -> G43

        try {
          let tool = line.substring(i, i + 3);

          if (tool.toLocaleUpperCase() == "G56") {
            output += "G43";
            i += 2;
            break hto_chars;
          }
        } catch (e) {}

        // G116 T## -> T## M06

        try {
          let command = line.substring(i, i + 6);

          let digit1 = parseInt(line[i + 6]);
          let digit2 = parseInt(line[i + 7]);

          if (
            command.toLocaleUpperCase() == "G116 T" &&
            !isNaN(digit1) &&
            !isNaN(digit2)
          ) {
            output += "T" + digit1 + digit2 + " M06";
            i += 7;
            break hto_chars;
          }
        } catch (e) {}

        // G116 T# -> T0# M06

        try {
          let command = line.substring(i, i + 6);

          let digit = parseInt(line[i + 6]);

          if (command.toLocaleUpperCase() == "G116 T" && !isNaN(digit)) {
            output += "T0" + digit + " M06";
            i += 6;
            break hto_chars;
          }
        } catch (e) {}

        output += c;
      } else {
        output += c;
      }
    }

    if (l + 1 < lines.length) output += "\n";
  }

  return output.trim();
}

// Rules:
// - For every instance of T# or T##...
// - Print the 2 lines before the tool, plus the tool the line is on.
// - Do this in increasing order of tool number, for every instance of each tool.

function findLowestZs(input) {
  let output = "";

  let lines = input.split("\n");

  let tools = [];

  let currentTool = 0;

  for (let l = 0; l < lines.length; l++) {
    let line = lines[l];

    for (let i = 0; i < line.length; i++) {
      let c = line[i];

      if (c == "(") {
        while (i + 1 < line.length && c != ")") {
          i++;
          c = line[i];
        }
      } else if (c.toLocaleUpperCase() == "G") {
        try {
          if (line.substring(i, i + 3).toLocaleUpperCase() == "G43") {
            i = line.length;
          }
        } catch (e) {}
      } else if (c.toLocaleUpperCase() == "T") {
        let digit1 = NaN;
        let digit2 = NaN;

        if (i + 1 < line.length) digit1 = parseInt(line[i + 1]);
        if (i + 2 < line.length) digit2 = parseInt(line[i + 2]);

        if (!isNaN(digit1)) {
          let text = "";

          if (l >= 2) text += lines[l - 2] + "\n";
          if (l >= 1) text += lines[l - 1] + "\n";
          text += line;

          i += 2;

          let tool = digit1;

          if (!isNaN(digit2)) {
            tool *= 10;
            tool += digit2;
            i++;
          }

          currentTool = tool;
        }
      } else if (c.toLocaleUpperCase() == "Z") {
        let word = line.substring(i).split(" ")[0];

        try {
          let depth = parseFloat(word.substring(1));

          if (tools[currentTool] == null || tools[currentTool] > depth)
            tools[currentTool] = depth;

          i += word.length;
        } catch (e) {}
      }
    }
  }

  for (let t = 0; t < tools.length; t++) {
    if (tools[t] != null) {
      if (t == 0)
        output +=
          "T00 = " +
          tools[t].toLocaleString("en-US", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 4,
          }) +
          "\n";
      else if (t < 10)
        output +=
          "T0" +
          t +
          " = " +
          tools[t].toLocaleString("en-US", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 4,
          }) +
          "\n";
      else
        output +=
          "T" +
          t +
          " = " +
          tools[t].toLocaleString("en-US", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 4,
          }) +
          "\n";
    }
  }

  return output.trim();
}

// Rules:
// - For every instance of T# or T##...
// - Print the 2 lines before the tool, plus the tool the line is on.
// - Do this in increasing order of tool number, for every instance of each tool.

function grabTools(input) {
  let output = "";

  let lines = input.split("\n");

  let tools = [];

  for (let l = 0; l < lines.length; l++) {
    let line = lines[l];

    for (let i = 0; i < line.length; i++) {
      let c = line[i];

      if (c == "(") {
        while (i + 1 < line.length && c != ")") {
          i++;
          c = line[i];
        }
      } else if (c.toLocaleUpperCase() == "T") {
        let digit1 = NaN;
        let digit2 = NaN;

        if (i + 1 < line.length) digit1 = parseInt(line[i + 1]);
        if (i + 2 < line.length) digit2 = parseInt(line[i + 2]);

        if (!isNaN(digit1)) {
          let text = "";

          if (l >= 2) text += lines[l - 2] + "\n";
          if (l >= 1) text += lines[l - 1] + "\n";
          text += line;

          i += 2;

          let tool = digit1;

          if (!isNaN(digit2)) {
            tool *= 10;
            tool += digit2;
            i++;
          }

          if (tools[tool] != null) tools[tool].push(text);
          else tools[tool] = [text];
        }
      }
    }
  }

  for (let t = 0; t < tools.length; t++) {
    if (tools[t] != null && tools[t].length != 0) {
      for (let i = 0; i < tools[t].length; i++) {
        output += tools[t][i] + "\n\n";
      }
    }
  }

  return output.trim();
}

// Rules:
// - After a line starting with G00, on the first line of the format G01 Z#...
// - Add 0.03 to the z-value, and place it on the line before.
//
// Example: G00; G01 Z0.01; G01 Z0.05; ==> G00; Z0.04; G01 Z0.01; G01 Z0.05;

function addNewZs(input) {
  let output = "";

  let lines = input.split("\n");

  let readyToAdd = false;

  for (let l = 0; l < lines.length; l++) {
    let line = lines[l];

    let words = line.split(" ");

    if (words.length > 0) {
      if (words[0].toLocaleUpperCase() == "G00") {
        readyToAdd = true;

        output += line + "\n";
      } else if (words[0].toLocaleUpperCase() == "G01") {
        if (readyToAdd && words.length >= 2) {
          try {
            let z_value = parseFloat(words[1].substring(1));

            z_value += 0.03;

            output +=
              "Z" +
              z_value
                .toLocaleString("en-US", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 4,
                })
                .replace("0.", ".") +
              "\n";
          } catch (e) {}
        }

        output += line + "\n";

        readyToAdd = false;
      } else {
        output += line + "\n";
      }
    }
  }

  return output.trim();
}

// Rules:
// - Ignore comments
// - At every G00 instruction that isn't followed by a G# instruction...
// - Replace the line with G00 Z#.#, where Z#.# is the larger of:
//      - The most recent Z value + 0.03
//      - The next Z value + 0.03
// - If neither exists, output the line as normal

function setNewZs(input) {
  let output = "";

  let lastZ = NaN;

  let lines = input.split("\n");

  for (let l = 0; l < lines.length; l++) {
    let line = lines[l];

    let words = line.split(" ");

    if (words.length > 0) {
      if (words[0].toLocaleUpperCase() == "G00") {
        if (words.length == 1 || !words[1].toLocaleUpperCase().includes("G")) {
          let nextZ = NaN;

          for (let j = l + 1; j < lines.length; j++) {
            let nextLine = lines[j];

            let nextWords = nextLine.split(" ");

            let isComment = false;

            if (nextWords.length > 0) {
              for (let w = 0; w < nextWords.length; w++) {
                let word = nextWords[w];

                if (word.length > 0) {
                  if (word[0] == "(") isComment = true;

                  if (!isComment) {
                    if ((word[0] == "Z" || word[0] == "z") && word.length > 1) {
                      try {
                        nextZ = parseFloat(word.substring(1));
                        j = lines.length;
                      } catch (e) {}
                    }
                  }

                  if (word[word.length - 1] == ")") isComment = false;
                }
              }
            }
          }

          if (!isNaN(nextZ) || !isNaN(lastZ)) {
            let newZ = Math.max(nextZ, lastZ) + 0.03;
            if (isNaN(nextZ)) newZ = lastZ + 0.03;
            if (isNaN(lastZ)) newZ = nextZ + 0.03;

            output +=
              "G00 Z" +
              newZ
                .toLocaleString("en-US", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 4,
                })
                .replace("0.", ".") +
              "\n";
          } else {
            output += line + "\n";
          }
        } else {
          output += line + "\n";
        }
      } else {
        let isComment = false;

        for (let w = 0; w < words.length; w++) {
          let word = words[w];

          if (word.length > 0) {
            if (word[0] == "(") isComment = true;

            if (!isComment) {
              if ((word[0] == "Z" || word[0] == "z") && word.length > 1) {
                try {
                  lastZ = parseFloat(word.substring(1));
                } catch (e) {}
              }
            }

            if (word[word.length - 1] == ")") isComment = false;
          }
        }

        output += line + "\n";
      }
    }
  }

  return output.trim();
}

function addDecimals(input) {
  let output = "";

  let lines = input.split("\n");

  for (let l = 0; l < lines.length; l++) {
    let line = lines[l];

    let words = line.split(" ");

    let isComment = false;

    for (let i = 0; i < words.length; i++) {
      let word = words[i];

      if (i != 0) output += " ";

      if (word.length > 0) {
        if (word[0] == "(") isComment = true;

        if (!isComment && "XYZ".includes(word[0].toLocaleUpperCase())) {
          try {
            let value = parseFloat(word.substring(1));

            output +=
              word[0] +
              value
                .toLocaleString("en-US", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 4,
                })
                .replace("0.", ".");
          } catch (e) {
            output += word;
          }
        } else {
          output += word;
        }

        if (word[word.length - 1] == ")") isComment = false;
      } else {
        output += word;
      }
    }

    output += "\n";
  }

  return output.trim();
}

// Rules:
// - Cut the first 6 characters of every line.
// - If a line has less than 6 characters, set it blank.

function removeSequenceNumbers(input) {
  let output = "";

  let lines = input.split("\n");

  for (let l = 0; l < lines.length; l++) {
    let line = lines[l];

    if (line.length > 6) output += line.substring(6) + "\n";
    else output += "\n";
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
            Conversion Tool
          </div>
          <Link href="./" className="absolute">
            <img src="./inverted-logo.png" className="h-12 mt-2 ml-4" />
          </Link>
          <span className="absolute mt-1 mr-8 font-semibold transition-colors cursor-pointer right-1 top-4 hover:text-cool-grey-900 text-cool-grey-500">
            <Link
              href="//drive.google.com/file/d/1CN_Xb9dpm3dpDMwEbjDmtKG6m7rchUwT/view?usp=drive_link"
              target="_blank"
            >
              Download
            </Link>
          </span>
        </div>
      </div>
    </>
  );
}
