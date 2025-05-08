// GET home page
export const productPage = async (req, res) => {
        res.render('product/index', {
        title: 'Trang chủ',
        page: 'product'
        });
}
  
