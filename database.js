/* === database.js === */
// Merged Database: LifeOrganizingDB + SpanishLearningDB
// Updated to Version 10

const DB_NAME = 'LifeOrganizingDB_TEST';
const db = new Dexie(DB_NAME);

// --- History (Versions 1-9 preserved for migration) ---

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

// (Versions 2-6 assumed implicit)

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

// Version 9 (Current Life Schema)
db.version(9).stores({
    widgetCache: 'id, version, lastUpdated', 
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

// --- NEW VERSION 10: UNIFIED DATABASE ---
// Adds Spanish Learning tables to the existing Life Organizer tables
db.version(10).stores({
    // 1. Life Organizer Tables (Preserved)
    widgetCache: 'id, version, lastUpdated', 
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

    // 2. Spanish Learning Tables (Added)
    words: '++id, &spanish, english, learned',
    sentences: '++id, &spanish, english, learned',
    myVocabulary: '++id, &[spanish+source], english, source',
    verbs: '++id, infinitive, mood, tense, learned',
    /* activityLog tracks study history and results */
    activityLog: '++id, timestamp, type, result'
});

// --- NEW VERSION 11: Error Logging ---
db.version(11).stores({
    // New Table for System Logs
    errorLogs: '++id, timestamp, message, source',

    // ... Repeat ALL previous tables to keep them ...
    widgetCache: 'id, version, lastUpdated', 
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
    words: '++id, &spanish, english, learned',
    sentences: '++id, &spanish, english, learned',
    myVocabulary: '++id, &[spanish+source], english, source',
    verbs: '++id, infinitive, mood, tense, learned',
    activityLog: '++id, timestamp, type, result'
});

window.db = db;