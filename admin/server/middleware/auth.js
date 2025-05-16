const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Auth Middleware: Token received:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      console.log('Auth Middleware: No token provided');
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth Middleware: Decoded token:', decoded);
    
    // Allow hardcoded admin user
    if (decoded.id === 'admin') {
      console.log('Auth Middleware: Admin user detected');
      req.user = { 
        user_id: 'admin', 
        username: 'admin', 
        user_type: 'admin',
        isAdmin: true 
      };
      return next();
    }
    
    // For non-admin users, verify they exist in the database
    if (!decoded.user_id || !decoded.user_type) {
      console.log('Auth Middleware: Invalid token payload');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token payload' 
      });
    }
    
    req.user = decoded;
    console.log('Auth Middleware: User authenticated:', req.user);
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};