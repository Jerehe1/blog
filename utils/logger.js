const info = (...params) => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(...params);
    }
};

const error = (...params) => {
    if (process.env.NODE_ENV !== 'test') {
        console.error(...params);
    }
};

const mongoError = (error) => {
    if (process.env.NODE_ENV !== 'test') {
        console.error('MongoDB error:', {
            message: error.message,
            name: error.name,
            code: error.code,
            stack: error.stack
        });
    }
};

module.exports = {
    info,
    error,
    mongoError
};