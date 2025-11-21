/* === database.js === */
// Defines the Dexie database schema, including the new widgetCache for the Shell architecture.

const DB_NAME = 'LifeOrganizingDB_TEST';
const db = new Dexie(DB_NAME);

// V1-V7: Legacy Schema History (Preserved for migration compatibility)
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

// ... Intermediate versions omitted for brevity, Dexie handles the chain ...

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

// --- VERSION 8: Shell + Remote Widget Architecture ---
// widgetCache: Stores the HTML/JS string of the remote widgets locally
db.version(8).stores({
    widgetCache: 'id, version, lastUpdated', // id = widget filename or key (e.g., 'tasks-today')
    // Keep existing tables
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