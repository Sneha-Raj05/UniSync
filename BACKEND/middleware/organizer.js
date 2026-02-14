const organizer = (req, res, next) => {
    if (!req.userRole || req.userRole.toLowerCase() !== 'organizer') { 
        return res.status(403).json({ message: 'Access denied: Organizer role required.' });
    }
    next();
};

export default organizer;