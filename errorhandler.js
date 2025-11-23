/* === errorHandler.js === */
window.ErrorHandler = {
    init() {
        // Catch synchronous errors
        window.onerror = (message, source, lineno, colno, error) => {
            this.logError('Global Crash', message, error, source);
            return false; // Let default handler run too (console log)
        };

        // Catch Promise rejections (Async errors)
        window.onunhandledrejection = (event) => {
            this.logError('Unhandled Promise', event.reason);
        };

        console.log("🛡️ Error Handler Initialized");
    },

    /**
     * Logs error to Console, UI (Toast), and Database
     */
    async logError(context, message, errorObj = null, source = null) {
        const timestamp = Date.now();
        
        // Format message
        let fullMessage = message;
        if (errorObj && errorObj.message) fullMessage = errorObj.message;
        if (typeof fullMessage === 'object') fullMessage = JSON.stringify(fullMessage);

        // 1. Console Log (for debugging)
        console.error(`[${context}]`, fullMessage, errorObj);

        // 2. UI Notification (Toast)
        if (window.Bridge && window.Bridge.showToast) {
            window.Bridge.showToast(`⚠️ ${context}: ${fullMessage.substring(0, 40)}...`);
        }

        // 3. Persist to Database
        try {
            if (window.db && window.db.errorLogs) {
                await window.db.errorLogs.add({
                    timestamp: timestamp,
                    message: `[${context}] ${fullMessage}`,
                    stack: errorObj ? errorObj.stack : 'No stack trace',
                    source: source || window.location.href
                });
                
                // Auto-cleanup: Keep only last 100 logs
                const count = await window.db.errorLogs.count();
                if (count > 100) {
                    const keys = await window.db.errorLogs.orderBy('timestamp').limit(count - 100).keys();
                    await window.db.errorLogs.bulkDelete(keys);
                }
            }
        } catch (dbError) {
            console.error("CRITICAL: Failed to log error to DB", dbError);
        }
    }
};

// Start listening immediately
window.ErrorHandler.init();