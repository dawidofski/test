/* === errorHandler.js === */
window.ErrorHandler = {
    init() {
        // Catch synchronous errors
        window.onerror = (message, source, lineno, colno, error) => {
            this.logError('Global Crash', message, error, source);
            return false; 
        };

        // Catch Promise rejections (Async errors)
        window.onunhandledrejection = (event) => {
            // event.reason is usually the error object
            this.logError('Unhandled Promise', event.reason);
        };

        console.log("🛡️ Error Handler Initialized");
    },

    /**
     * Logs error to Console, UI (Toast), and Database
     * Supports: logError(context, messageString, errorObj)
     * Supports: logError(context, errorObj)
     */
    async logError(context, messageOrError, errorObj = null, source = null) {
        const timestamp = Date.now();
        
        let fullMessage = messageOrError;
        let finalErrorObj = errorObj;

        // 1. Intelligent Argument Handling
        if (messageOrError instanceof Error) {
            // Called as logError('Ctx', error)
            fullMessage = messageOrError.message;
            finalErrorObj = messageOrError;
        } else if (typeof messageOrError === 'object') {
            // Called with some other object
            try {
                fullMessage = JSON.stringify(messageOrError);
            } catch (e) {
                fullMessage = "Non-serializable Object";
            }
        }

        // Ensure we have a string for the message
        if (!fullMessage) fullMessage = "Unknown Error";

        // 2. Console Log (Expanded for debugging)
        console.error(`[${context}]`, fullMessage, finalErrorObj);

        // 3. UI Notification (Toast)
        if (window.Bridge && window.Bridge.showToast) {
            window.Bridge.showToast(`⚠️ ${context}: ${fullMessage}`);
        }

        // 4. Persist to Database
        try {
            if (window.db && window.db.errorLogs) {
                await window.db.errorLogs.add({
                    timestamp: timestamp,
                    message: `[${context}] ${fullMessage}`,
                    stack: finalErrorObj ? finalErrorObj.stack : 'No stack trace',
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
            // Fallback if DB fails (don't crash the error handler!)
            console.warn("Failed to log error to DB:", dbError);
        }
    }
};

// Start listening immediately
window.ErrorHandler.init();