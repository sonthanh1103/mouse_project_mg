import Brand from "../models/brand.js";

export const brandPage = (req, res) => {
    res.render('product/brand', {
        title: 'Brand',
        page: 'brand'
    })
}