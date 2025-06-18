const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // Super admin has access to everything
        if (req.user.type === 'super_admin') {
            return next();
        }
        // For admin management routes, only super admin should have access
        if (req.path.includes('/admin') && req.user.type !== 'super_admin') {
            return res.status(403).json({ message: 'Only super admin can manage admin accounts' });
        }
        // For other routes, check if user has required role
        if (!roles.includes(req.user.type)) {
            return res.status(403).json({ message: 'You do not have permission to perform this action' });
        }
        next();
    };
}; 