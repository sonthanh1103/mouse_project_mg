const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "Admin") {
      return next();
    }
    return res.redirect('/');
  };
  
export default isAdmin;