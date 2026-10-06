// Central error handler — anything passed to next(err) or thrown in an
// async route (Express 5 forwards rejected promises) ends up here.
const errorHandler = (err, req, res, next) => {
    // multer upload errors (file too large, too many files, bad type) are client errors
    let status = err.status || err.statusCode || (err.name === 'MulterError' ? 400 : 500);
    if (err.message?.startsWith('Only JPG, PNG and WEBP')) status = 400;

    if (status >= 500) console.error(err);

    res.status(status).json({
        success: false,
        // don't leak internals (SQL, stack details) from unexpected errors in production
        message: status >= 500 && process.env.NODE_ENV === 'production'
            ? 'Internal Server Error'
            : err.message || 'Internal Server Error',
    });
};

module.exports = errorHandler;
