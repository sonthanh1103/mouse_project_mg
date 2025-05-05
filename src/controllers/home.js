// GET home page
export const home = async (req, res) => {
    try {
        res.render('index', { title: 'Trang chủ' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }