const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "Admin") {
      return next();
    }
    return res.render('errors/permission', {
      title: 'Permission'
    });
  };
  
export default isAdmin;