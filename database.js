<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Home Shell</title>
    <script src="https://unpkg.com/dexie@3/dist/dexie.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        :root {
            --bg-color: #f4f7f6;
            --card-bg: #ffffff;
            --text-main: #333333;
            --text-sub: #6c757d;
            --shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        @media (prefers-color-scheme: dark) {
            :root {
                --bg-color: #121212;
                --card-bg: #1e1e1e;
                --text-main: #e0e0e0;
                --text-sub: #aaaaaa;
                --shadow: 0 4px 12px rgba(0,0,0,0.3);
            }
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-main);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            padding-bottom: 80px; /* Space for bottom bar */
            overflow-x: hidden;
        }

        /* Widget Containers */
        .widget-wrapper {
            background: var(--card-bg);
            border-radius: 16px;
            box-shadow: var(--shadow);
            margin-bottom: 20px;
            min-height: 150px; /* Prevent layout shift */
            overflow: hidden;
            transition: transform 0.2s;
        }
        .widget-wrapper:active { transform: scale(0.99); }

        /* Bottom Navigation */
        .bottom-dock {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 400px;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            z-index: 100;
        }
        @media (prefers-color-scheme: dark) {
            .bottom-dock { background: rgba(30, 30, 30, 0.85); }
        }

        .search-bar {
            flex-grow: 1;
            background: transparent;
            border: none;
            font-size: 16px;
            color: var(--text-main);
            padding: 8px;
        }
        .search-bar:focus { outline: none; }
        .icon-btn {
            font-size: 24px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0 10px;
            filter: grayscale(100%);
            transition: filter 0.2s;
        }
        .icon-btn:hover { filter: grayscale(0%); }

        /* Overlays */
        .overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: var(--bg-color);
            z-index: 1000;
            transform: translateY(100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow-y: auto;
            padding: 20px;
            box-sizing: border-box;
        }
        .overlay.open { transform: translateY(0); }
        .close-overlay {
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 30px;
            cursor: pointer;
            color: var(--text-main);
            z-index: 1001;
        }

        /* Loading State */
        .loading-pulse {
            height: 100%;
            width: 100%;
            background: linear-gradient(90deg, var(--card-bg) 25%, var(--bg-color) 50%, var(--card-bg) 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
        }
        @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    </style>
    
    <!-- INLINED DATABASE.JS -->
    <script>
    (function() {
        if (!window.Dexie) {
            console.error("Dexie.js not found!");
            return;
        }
        console.log("Initializing Database...");
        const DB_NAME = 'LifeOrganizingDB_TEST';
        const db = new Dexie(DB_NAME);

        // Define Schema - Including all legacy versions + new cache table
        db.version(1).stores({
            habits: '++id, name, category, status, createdAt, *recurrenceDays',
            habitHistory: '++id, [habitId+date], habitId, date, status',
            tasks: '++id, name, category, priority, dueDate, status, notes, *recurrenceDays, recurrenceInterval, recurrenceUnit',
            taskHistory: '++id, [taskId+date], taskId, date, status',
            goals: '++id, name, category, type, status, endDate, [type+status], notes',
            mood: '++id, value, datetime, *tags, notes',
            sobrietyTrackers: '++id, &name, startDate, notes',
            sobrietyRelapses: '++id, trackerId, datetime, [trackerId+datetime], amount, notes',
            sobrietyUrges: '++id, trackerId, datetime, intensity, trigger, notes',
            financeTransactions: '++id, type, category, date, [type+date], [category+date], amount, notes',
            financeCategories: '++id, &name, color',
            healthMetrics: '++id, type, date, value, [type+date], notes',
            nutritionLogs: '++id, date, mealType, [date+mealType], notes',
            waterLogs: '++id, date, amountMl',
            history: '++id',
            systemValidation: '++id'
        });

        db.version(2).stores({
            goals: '++id, name, category, status, dueDate, notes',
            subGoals: '++id, goalId, name, isComplete, [goalId+isComplete]',
        });

        db.version(3).stores({
            goals: '++id, name, category, status, dueDate, notes, parentId, targetAmount, isComplete',
            subGoals: null,
        });
        
        db.version(4).stores({ settings: 'key' });

        db.version(5).stores({
            nutritionLogs: '++id, date, mealType, foodName, calories, protein, fat, carbs, servingSizeG, notes, [date+mealType]',
        });

        db.version(6).stores({
            sobrietyTrackers: '++id, &name, startDate, notes, costPerItem, timePerItemMinutes, resetDate',
        });
        
        db.version(7).stores({
            healthTimeSeries: '++id, type, datetime, value, [type+datetime]', 
            sleepLogs: '++id, date, time, durationSeconds, stage, [date+time]',
            settings: 'key', 
            goals: '++id, name, category, status, dueDate, notes, parentId, targetAmount, isComplete',
            habits: '++id, name, category, status, createdAt, *recurrenceDays',
            habitHistory: '++id, [habitId+date], habitId, date, status',
            tasks: '++id, name, category, priority, dueDate, status, notes, *recurrenceDays, recurrenceInterval, recurrenceUnit',
            taskHistory: '++id, [taskId+date], taskId, date, status',
            mood: '++id, value, datetime, *tags, notes',
            sobrietyTrackers: '++id, &name, startDate, notes, costPerItem, timePerItemMinutes, resetDate',
            sobrietyRelapses: '++id, trackerId, datetime, [trackerId+datetime], amount, notes',
            sobrietyUrges: '++id, trackerId, datetime, intensity, trigger, notes',
            financeTransactions: '++id, type, category, date, [type+date], [category+date], amount, notes',
            financeCategories: '++id, &name, color',
            healthMetrics: '++id, type, date, value, [type+date]',
            nutritionLogs: '++id, date, mealType, foodName, calories, protein, fat, carbs, servingSizeG, notes, [date+mealType]',
            waterLogs: '++id, date, amountMl',
            history: '++id, timestamp, action, table, recordId, [table+recordId]',
            systemValidation: '++id',
        });

        // --- NEW VERSION 8: PWA Widget Caching ---
        db.version(8).stores({
            // Key is the widget ID string (e.g., 'tasks-today')
            widgetCache: 'id, version, lastUpdated',
            // Retain all previous tables
            healthTimeSeries: '++id, type, datetime, value, [type+datetime]', 
            sleepLogs: '++id, date, time, durationSeconds, stage, [date+time]',
            settings: 'key', 
            goals: '++id, name, category, status, dueDate, notes, parentId, targetAmount, isComplete',
            habits: '++id, name, category, status, createdAt, *recurrenceDays',
            habitHistory: '++id, [habitId+date], habitId, date, status',
            tasks: '++id, name, category, priority, dueDate, status, notes, *recurrenceDays, recurrenceInterval, recurrenceUnit',
            taskHistory: '++id, [taskId+date], taskId, date, status',
            mood: '++id, value, datetime, *tags, notes',
            sobrietyTrackers: '++id, &name, startDate, notes, costPerItem, timePerItemMinutes, resetDate',
            sobrietyRelapses: '++id, trackerId, datetime, [trackerId+datetime], amount, notes',
            sobrietyUrges: '++id, trackerId, datetime, intensity, trigger, notes',
            financeTransactions: '++id, type, category, date, [type+date], [category+date], amount, notes',
            financeCategories: '++id, &name, color',
            healthMetrics: '++id, type, date, value, [type+date]',
            nutritionLogs: '++id, date, mealType, foodName, calories, protein, fat, carbs, servingSizeG, notes, [date+mealType]',
            waterLogs: '++id, date, amountMl',
            history: '++id, timestamp, action, table, recordId, [table+recordId]',
            systemValidation: '++id',
        });

        window.db = db;
        console.log("Database Initialized successfully.");
    })();
    </script>
</head>
<body>

    <!-- Widget Slots -->
    <div id="tasks-today" class="widget-wrapper"><div class="loading-pulse" style="height:200px"></div></div>
    <div id="habits-today" class="widget-wrapper"><div class="loading-pulse" style="height:180px"></div></div>
    <div id="mood-average" class="widget-wrapper"><div class="loading-pulse" style="height:220px"></div></div>
    <div id="finance-analytics" class="widget-wrapper"><div class="loading-pulse" style="height:300px"></div></div>

    <!-- Bottom Dock -->
    <div class="bottom-dock">
        <button class="icon-btn" onclick="openOverlay('search')">🔍</button>
        <input type="text" class="search-bar" placeholder="Search..." readonly onclick="openOverlay('search')">
        <button class="icon-btn" onclick="openOverlay('settings')">⚙️</button>
    </div>

    <!-- Overlays -->
    <div id="overlay-search" class="overlay">
        <div class="close-overlay" onclick="closeOverlays()">&times;</div>
        <div id="overlay-search-content"></div>
    </div>

    <div id="overlay-settings" class="overlay">
        <div class="close-overlay" onclick="closeOverlays()">&times;</div>
        <div id="overlay-settings-content"></div>
    </div>

    <script>
        // Fallback configuration if fetching fails (which it will in single-file preview)
        const DEFAULT_WIDGET_CONFIG = [
            { "id": "tasks-today", "url": "widgets/tasks-today.html", "version": "1.0.0" },
            { "id": "habits-today", "url": "widgets/habits-today.html", "version": "1.0.0" },
            { "id": "mood-average", "url": "widgets/mood-average.html", "version": "1.0.0" },
            { "id": "finance-analytics", "url": "widgets/finance-analytics.html", "version": "1.0.0" }
        ];

        // --- Widget Loader Engine ---
        class WidgetLoader {
            constructor() {
                this.widgets = [];
            }

            async init() {
                // 1. Fetch Config or use Fallback
                try {
                    const response = await fetch('widgets/widgets.json');
                    if (response.ok) {
                        this.widgets = await response.json();
                    } else {
                        throw new Error("Not found");
                    }
                } catch (e) {
                    console.warn("Using default widget config (offline/preview mode)");
                    this.widgets = DEFAULT_WIDGET_CONFIG;
                }

                // 2. Process Widgets
                this.widgets.forEach(widget => this.loadSingleWidget(widget));
            }

            async loadSingleWidget(widget) {
                const container = document.getElementById(widget.id);
                if (!container) return;

                // A. Check Cache (Stale)
                let cached = null;
                try {
                    cached = await window.db.widgetCache.get(widget.id);
                } catch (e) {
                    console.error("Error reading cache", e);
                }

                if (cached) {
                    console.log(`[Loader] Rendering cached: ${widget.id} (v${cached.version})`);
                    this.render(container, cached.html);
                } else {
                     // Visual placeholder for empty state
                     container.innerHTML = `<div class="p-5 text-center text-gray-400">Waiting for content (${widget.id})...</div>`;
                }

                // B. Revalidate (Background)
                try {
                    // Try to fetch. In preview, this might fail 404 for relative paths unless file structure exists.
                    // For demonstration, we won't break the UI if fetch fails.
                    const response = await fetch(widget.url, { cache: "no-cache" });
                    if (!response.ok) throw new Error(`Network error: ${response.status}`);
                    
                    const remoteHtml = await response.text();
                    
                    if (!cached || cached.html !== remoteHtml) {
                        console.log(`[Loader] Updating: ${widget.id}`);
                        await window.db.widgetCache.put({
                            id: widget.id,
                            html: remoteHtml,
                            version: widget.version,
                            lastUpdated: Date.now()
                        });
                        this.render(container, remoteHtml);
                    }
                } catch (e) {
                    console.warn(`[Loader] Could not fetch remote widget ${widget.id}`, e);
                    if (!cached) {
                        container.innerHTML = `
                        <div style="padding:20px; text-align:center; color: gray;">
                            <p>Widget not found in preview.</p>
                            <small>${widget.id}</small>
                        </div>`;
                    }
                }
            }

            render(container, html) {
                const range = document.createRange();
                range.selectNode(document.body);
                const fragment = range.createContextualFragment(html);
                container.innerHTML = '';
                container.appendChild(fragment);
            }
        }

        // --- Overlay Management ---
        async function openOverlay(type) {
            const overlay = document.getElementById(`overlay-${type}`);
            const contentId = `overlay-${type}-content`;
            const contentDiv = document.getElementById(contentId);
            
            const fileMap = {
                'search': 'widgets/app-launcher.html',
                'settings': 'widgets/db-utilities.html'
            };

            if (contentDiv.innerHTML === '') {
                 try {
                    contentDiv.innerHTML = '<div class="loading-pulse" style="height:50px"></div>';
                    const response = await fetch(fileMap[type]);
                    if(!response.ok) throw new Error("File not found");
                    
                    const html = await response.text();
                    const range = document.createRange();
                    range.selectNode(document.body);
                    const fragment = range.createContextualFragment(html);
                    contentDiv.innerHTML = '';
                    contentDiv.appendChild(fragment);
                } catch(e) {
                    contentDiv.innerHTML = `<div class="p-5 text-center">
                        <h3 class="text-xl font-bold">Content Unavailable</h3>
                        <p class="text-sm text-gray-500">Could not load ${fileMap[type]}. In a real deployment, this file would exist.</p>
                    </div>`;
                }
            }
            overlay.classList.add('open');
        }

        function closeOverlays() {
            document.querySelectorAll('.overlay').forEach(el => el.classList.remove('open'));
        }

        // --- Init ---
        window.addEventListener('DOMContentLoaded', () => {
            // Check explicitly for window.db which was set by the inline script
            if (window.db) {
                const loader = new WidgetLoader();
                loader.init();
            } else {
                console.error("Database not initialized. Check the inline script.");
                document.body.innerHTML = "<h1 style='color:red; padding:20px;'>Critical Error: Database failed to initialize.</h1>";
            }
        });

    </script>
</body>
</html>