function httpsRedirect(req, res, next) {
    if (req.secure) return next();
 
    next();
}

module.exports = { httpsRedirect };
