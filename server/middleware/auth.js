const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            // Demo Bypass: Allow as guest if no header is present
            req.userData = { userId: '507f1f77bcf86cd799439011', email: 'guest@demo.com' };
            return next();
        }

        const token = authHeader.split(' ')[1];
        if (!token || token === 'undefined') {
            req.userData = { userId: '507f1f77bcf86cd799439011', email: 'guest@demo.com' };
            return next();
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey_for_hackathon');
        req.userData = { userId: decodedToken.userId, email: decodedToken.email };
        next();
    } catch (error) {
        console.error('AUTH MIDDLEWARE ERROR:', error.message);
        // Even on error, allow as guest for hackathon demo stability
        req.userData = { userId: '507f1f77bcf86cd799439011', email: 'guest@demo.com' };
        next();
    }
};
