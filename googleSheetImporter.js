/* === googleSheetImporter.js === */

// 1. CONFIGURATION: Your Web App URL
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwAOrY3BHpnx2JPKdelLp6KyXNmzyUCTJVs7l8V-TPZY_NhzBlSUTHA9EOjOwl0i_CS/exec';

// ----------------------------------------------------------------------
// 1. IMPORT STEPS
// ----------------------------------------------------------------------
async function importStepData() {
  console.log('Importing steps...');
  try {
    const data = await fetchData('steps');
    
    // Transform [ ['2025-10-11', '22256'], ... ]
    // to: [ { type: 'steps', datetime: Date, value: 22256 }, ... ]
    const healthData = data.map(row => {
      const date = row[0]; // '2025-10-11'
      const steps = parseInt(row[1], 10);
      
      if (!date || isNaN(steps)) return null;
      
      return {
        type: 'steps',
        datetime: new Date(date), // Stores as Date object at midnight
        value: steps
      };
    }).filter(Boolean); // Remove any null entries

    if (healthData.length === 0) {
      console.log('No new step data found.');
      return;
    }

    // bulkPut() creates new or updates existing records.
    // This uses the [type+datetime] index to prevent duplicates.
    await db.healthTimeSeries.bulkPut(healthData);

    console.log(`Successfully imported/updated ${healthData.length} step records.`);

  } catch (error) {
    console.error('Error importing step data:', error);
    alert('Error importing step data: ' + error.message);
  }
}

// ----------------------------------------------------------------------
// 2. IMPORT HEART RATE
// ----------------------------------------------------------------------
async function importHeartRateData() {
  console.log('Importing heart rate...');
  try {
    const data = await fetchData('heartrate');
    
    // Transform [ ['2025-09-26', '16:10:29', '66'], ... ]
    // to: [ { type: 'heartrate', datetime: Date, value: 66 }, ... ]
    const healthData = data.map(row => {
      const date = row[0]; // '2025-09-26'
      const time = row[1]; // '16:10:29'
      const bpm = parseInt(row[2], 10);
      
      if (!date || !time || isNaN(bpm)) return null;

      return {
        type: 'heartrate',
        datetime: new Date(`${date}T${time}`), // Creates a full Date object
        value: bpm
      };
    }).filter(Boolean);

    if (healthData.length === 0) {
      console.log('No new heart rate data found.');
      return;
    }

    // bulkPut() uses the [type+datetime] index to prevent duplicates.
    await db.healthTimeSeries.bulkPut(healthData);

    console.log(`Successfully imported/updated ${healthData.length} heart rate records.`);

  } catch (error) {
    console.error('Error importing heart rate data:', error);
    alert('Error importing heart rate data: ' + error.message);
  }
}

// ----------------------------------------------------------------------
// 3. IMPORT SLEEP
// ----------------------------------------------------------------------
async function importSleepData() {
  console.log('Importing sleep data...');
  try {
    const rawData = await fetchData('sleep');
    
    // Transform [ ['2025-09-28', '1:07:00', '780', '1:00'], ... ]
    // to: [ { date: '2025-09-28', time: '1:07:00', ... }, ... ]
    const sleepLogs = rawData.map(row => {
      const date = row[0];
      const time = row[1];
      const duration = parseInt(row[2], 10);
      const stage = row[3];
      
      if (!date || !time || isNaN(duration) || !stage) return null;
      
      return {
        date: date,
        time: time,
        durationSeconds: duration,
        stage: stage
      };
    }).filter(Boolean);

    if (sleepLogs.length === 0) {
      console.log('No new sleep data found.');
      return;
    }
    
    // bulkPut() uses the [date+time] index to prevent duplicates.
    await db.sleepLogs.bulkPut(sleepLogs);

    console.log(`Successfully imported/updated ${sleepLogs.length} sleep records.`);

  } catch (error) {
    console.error('Error importing sleep data:', error);
    alert('Error importing sleep data: ' + error.message);
  }
}


// ----------------------------------------------------------------------
// Reusable helper function to fetch data from the Web App
// ----------------------------------------------------------------------
async function fetchData(type) {
  console.log(`Fetching ${type} data...`);
  const response = await fetch(`${WEB_APP_URL}?type=${type}`);
  if (!response.ok) {
    throw new Error(`Network error: ${response.statusText}`);
  }
  
  const result = await response.json();
  if (!result.success) {
    throw new Error(`API error: ${result.error}`);
  }
  
  console.log(`Received ${result.data.length} ${type} records.`);
  return result.data;
}