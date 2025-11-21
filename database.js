<!-- This file is loaded inside the Shell's Overlay div -->
<style>
    .util-container { font-family: -apple-system, sans-serif; color: var(--text-color); }
    .util-section { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
    .util-btn {
        width: 100%;
        padding: 12px;
        margin: 5px 0;
        border-radius: 8px;
        border: none;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
    }
    .util-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .btn-backup { background-color: #24292e; color: white; } /* GitHub Color */
    .btn-reset { background-color: #dc3545; color: white; }
    .btn-restore { background-color: #28a745; color: white; }
    
    .status-log {
        background: rgba(0,0,0,0.05);
        padding: 10px;
        border-radius: 6px;
        font-family: monospace;
        font-size: 12px;
        min-height: 60px;
        max-height: 150px;
        overflow-y: auto;
    }
</style>

<div class="util-container">
    
    <div class="util-section">
        <h3>☁️ Cloud Backup</h3>
        <p style="font-size: 0.9em; color: #666;">Backs up 'LifeOrganizingDB_TEST' to your private GitHub repo.</p>
        <button id="btn-gh-backup" class="util-btn btn-backup">Backup to GitHub</button>
        <button id="btn-gh-restore" class="util-btn btn-restore">Restore from GitHub</button>
    </div>

    <div class="util-section">
        <h3>⚠️ Danger Zone</h3>
        <button id="btn-wipe" class="util-btn btn-reset">Wipe Database</button>
    </div>

    <div class="util-section">
        <h3>Log</h3>
        <div id="backup-log" class="status-log">Ready...</div>
    </div>

</div>

<script>
    // Since this is injected into index.html, 'db' is already available globally.
    // We wrap in an IIFE to avoid variable pollution in the global scope.
    (() => {
        const logEl = document.getElementById('backup-log');
        const btnBackup = document.getElementById('btn-gh-backup');
        const btnRestore = document.getElementById('btn-gh-restore');
        const btnWipe = document.getElementById('btn-wipe');

        // --- CONFIGURATION ---
        // NOTE: In a real app, never hardcode tokens. 
        // Since this is a personal local PWA, we use the provided token.
        const GH_TOKEN = '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';
        const REPO_OWNER = 'dawidofski';
        const REPO_NAME = 'backup';
        const FILE_PATH = 'life_organizer_backup.json'; 
        const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

        function log(msg) {
            const line = document.createElement('div');
            line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
            logEl.prepend(line);
        }

        // --- EXPORT LOGIC ---
        async function exportDB() {
            log('Starting export...');
            try {
                const data = {};
                // Iterate all tables in the global 'db' object
                await db.transaction('r', db.tables, async () => {
                    for (const table of db.tables) {
                        // Skip cache, history, or system tables if desired. 
                        // Currently backing up everything except widgetCache to save space.
                        if (table.name !== 'widgetCache') {
                            data[table.name] = await table.toArray();
                        }
                    }
                });
                return JSON.stringify(data);
            } catch (e) {
                throw new Error('DB Export failed: ' + e.message);
            }
        }

        // --- GITHUB API LOGIC ---
        async function getFileSHA() {
            try {
                const res = await fetch(API_URL, {
                    headers: { 
                        'Authorization': `token ${GH_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                if (res.status === 404) return null; // File doesn't exist yet
                const json = await res.json();
                return json.sha;
            } catch (e) {
                return null;
            }
        }

        async function uploadToGitHub(content) {
            const sha = await getFileSHA();
            const dateStr = new Date().toISOString().split('T')[0];
            
            // Base64 encode (handle UTF8)
            const contentBase64 = btoa(unescape(encodeURIComponent(content)));

            const body = {
                message: `Auto-backup ${dateStr}`,
                content: contentBase64
            };
            if (sha) body.sha = sha;

            const res = await fetch(API_URL, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GH_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error(`GitHub API Error: ${res.status}`);
        }

        async function downloadFromGitHub() {
            const res = await fetch(API_URL, {
                headers: { 
                    'Authorization': `token ${GH_TOKEN}`,
                    'Accept': 'application/vnd.github.v3.raw' // Get raw content
                }
            });
            if (!res.ok) throw new Error('Download failed');
            return await res.json();
        }

        // --- EVENT HANDLERS ---

        btnBackup.addEventListener('click', async () => {
            btnBackup.disabled = true;
            log('⏳ Backing up...');
            try {
                const json = await exportDB();
                await uploadToGitHub(json);
                log('✅ Backup successful!');
            } catch (e) {
                log('❌ Error: ' + e.message);
                console.error(e);
            }
            btnBackup.disabled = false;
        });

        btnRestore.addEventListener('click', async () => {
            if(!confirm("Overwrite local data with GitHub backup?")) return;
            
            btnRestore.disabled = true;
            log('⏳ Downloading...');
            try {
                const data = await downloadFromGitHub();
                log('📥 Importing to DB...');
                
                await db.transaction('rw', db.tables, async () => {
                    // Clear existing tables (except cache)
                    for (const table of db.tables) {
                        if (table.name !== 'widgetCache') {
                            await table.clear();
                            if (data[table.name]) {
                                await table.bulkAdd(data[table.name]);
                            }
                        }
                    }
                });
                log('✅ Restore complete! Reloading...');
                setTimeout(() => location.reload(), 1000);
            } catch (e) {
                log('❌ Error: ' + e.message);
            }
            btnRestore.disabled = false;
        });

        btnWipe.addEventListener('click', async () => {
            if(!confirm("Wipe ALL data? This cannot be undone.")) return;
            await db.delete();
            location.reload();
        });

        // --- AUTOMATED BACKUP CHECK ---
        // Simple logic: Check local storage for last backup time. If > 24h, run backup.
        async function checkAutoBackup() {
            const lastBackup = localStorage.getItem('last_gh_backup');
            const now = Date.now();
            const ONE_DAY = 24 * 60 * 60 * 1000;

            if (!lastBackup || (now - parseInt(lastBackup)) > ONE_DAY) {
                log('🔄 Running auto-backup...');
                try {
                    const json = await exportDB();
                    await uploadToGitHub(json);
                    localStorage.setItem('last_gh_backup', now.toString());
                    log('✅ Auto-backup finished.');
                } catch (e) {
                    log('⚠️ Auto-backup failed (will retry later).');
                }
            }
        }
        
        checkAutoBackup();

    })();
</script>