# AI Employee Office — Phase 1

A local web app that looks like a small virtual office with **six AI employee characters**. Phase 1 is the complete interface: navigation, a task board, an activity feed, an operator panel and employee detail views.

> **Demo Mode.** No real AI runs in Phase 1. There are no API keys, no paid services and no microphone access. Everything happens in your browser.

## The team

| Name | Role |
|---|---|
| Anne | Central AI Operator |
| Tim | Research Analyst |
| Dwayne | Marketing Specialist |
| Bryan | Sales Specialist |
| Kelvin | Operations Manager |
| Kelsey | Finance Analyst |

## What works in Phase 1 (real behaviour)

- Sidebar navigation: Overview, Employees, Tasks, Team Activity, Settings. The current page is kept when you refresh.
- Six employee cards, each with its own hand-drawn SVG avatar, role, status and current task.
- Click a card (or **View details**) to open a detail window: responsibilities, assigned tasks, recent activity.
- Search (top bar) filters employees, tasks and activity.
- Create tasks, assign them to any employee, set priority, change status (Pending, In Progress, Needs Review, Completed), reassign or delete them.
- Employee status (Working, Reviewing, Online, Idle) is **calculated from their tasks**, so it updates when tasks change.
- The activity feed updates whenever a task is created, moved, reassigned or deleted.
- Everything is saved in your browser (localStorage) and survives a refresh.
- **Reset Demo** (Settings page) restores the sample data after a confirmation.
- Input validation, empty states, keyboard navigation, visible focus outlines, a "reduce animations" option.

## What is only simulated

- **Anne's routing** is simple keyword matching (for example "budget" goes to Kelsey). It is not AI, and the app says so.
- The sample tasks and the starting activity events are made-up demo data.
- The "Communication" box in each employee window is disabled. It says: *Agent communication will be connected in Phase 2.*
- Nothing here does voice, speech, AI model calls or agent-to-agent messaging.

## Prerequisites

- Windows 11 and any modern browser (Edge, Chrome or Firefox).
- **Option A (easiest):** nothing else.
- **Option B (recommended, closer to how Phase 2 will run):** Python 3. Check by opening the Start menu, typing `cmd`, pressing Enter and typing `py --version`. If it prints a version number you are set. If not, install Python from https://www.python.org/downloads/ and tick **"Add python.exe to PATH"** in the installer.

## How to run it

### Option A: double-click

1. Open the `ai-employee-office` folder.
2. Double-click **index.html**. It opens in your browser.

### Option B: tiny local server (recommended)

1. Open the `ai-employee-office` folder.
2. Double-click **start.bat**. A black window opens and your browser goes to http://localhost:8000.
3. Leave the black window open while you use the app.

Prefer typing commands? Open the folder, click the address bar, type `cmd`, press Enter, then run:

```
py -m http.server 8000 --bind 127.0.0.1
```

Then open http://localhost:8000 in your browser. (`py -m http.server` is Python's built-in way to share a folder as a website. `--bind 127.0.0.1` means only your own computer can see it.)

> Browsers store data per address. Data saved at `file:///...index.html` (Option A) is **separate** from data saved at `http://localhost:8000` (Option B). Stick to one option if you want your tasks to stay.

## How to stop it

- **Option A:** just close the browser tab.
- **Option B:** close the black window, or click it and press **Ctrl + C**.

## How to reset the demo data

Go to **Settings**, click **Reset Demo…**, then confirm. Your tasks and activity are replaced by the original samples.

If something is badly broken: press **F12**, open **Application** (Edge/Chrome), then **Local Storage**, and delete the key `aeo.state.v1`. Refresh the page.

## Troubleshooting

| Problem | Fix |
|---|---|
| `start.bat` says Python is not recognized | Install Python (see Prerequisites) and tick "Add python.exe to PATH". Or use Option A. |
| "Address already in use" / port 8000 busy | Another program uses port 8000. Change both `8000`s in `start.bat` to `8001` and open http://localhost:8001. |
| My tasks vanished | You probably opened the app a different way (file vs localhost), or you are in a Private/Incognito window, or browser data was cleared. See the note above. |
| A banner on Settings says storage is blocked | Your browser blocks local storage. Allow site data, or leave Private mode. |
| Page looks unstyled or empty | Keep all files together in the folder (`index.html`, `styles.css`, `js/`). Press Ctrl + F5 to hard refresh. |
| Windows SmartScreen warns about `start.bat` | It only runs the Python command shown above. Open it in Notepad to check, then choose "Run anyway". |

## Project layout

```
ai-employee-office/
  index.html      page structure
  styles.css      all styling (no external fonts or images)
  start.bat       optional one-click local server
  js/
    data.js       employee profiles, sample data, demo keyword routing (single source of truth)
    avatars.js    the six SVG characters
    store.js      state, saving to localStorage, task/activity actions
    app.js        drawing the screens and handling clicks
```

The UI never edits data directly. It only calls functions in `store.js`. In Phase 2 those functions can call a backend instead, and the screens stay the same.

## What Phase 2 will add

- Six independent agent profiles, with Anne as the real orchestrator
- A Python (FastAPI) backend with a shared task and message store
- Real AI models: local through Ollama, or an optional hosted model
- Real-time employee-to-employee communication
- Speech recognition from your microphone and distinct text-to-speech voices
- Speaking animations tied to real speech
- Human approval before any external or high-risk action

## Tests that were run (and not run)

Run: syntax checks; a Node test of the task/status/activity/persistence/reset logic; a headless Microsoft Edge run of the real page (22 checks covering navigation, validation, task creation, status changes, search, detail window, Anne's routing, saving, refresh persistence, reset and no JavaScript errors); desktop and narrow-width screenshots.

Not run: Firefox/Chrome (Edge only), a physical phone or screen reader, a real mouse and keyboard session (clicks were simulated in script), and the Reset confirmation dialog's button click (the reset itself was tested).
