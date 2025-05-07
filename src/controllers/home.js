// GET home page
export const home = async (req, res) => {
        res.render('product/index', {
        title: 'Trang chủ',
        page: 'product'
        });
}
  
