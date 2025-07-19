//// APP

// wrapper function for error handling
async function handle(promise) {
    try {
        return await promise;
    } catch (err) {
        throw err;
    }
}

//// EXPORTS

module.exports = handle;
