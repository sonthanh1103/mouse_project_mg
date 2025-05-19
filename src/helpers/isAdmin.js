const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "Admin") {
      return next();
    }
    return res.render('errors/permission', {
      title: '403 - Không có quyền truy cập'
    });
  };
  
export default isAdmin;