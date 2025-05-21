export const pageNotFound = async (req, res) => {
    res.render('errors/error-404', {
        title: 'Page Not Found'
    })
}

export const dashboardPage = async (req, res) => {
    res.render('productUI/dashboard', {
        title: 'Dashboard',
        page: 'dashboard'
    })
}

export const comparePage = async (req, res) => {
    res.render('productUI/compare', {
        title: 'Compare',
        page: 'compare'
    })
}

export const databasePage = async (req, res) => {
    res.render('productUI/database', {
        title: 'Database',
        page: 'database'
    })
}

export const reviewPage = async (req, res) => {
    res.render('productUI/reviews', {
        title: 'Reviews',
        page: 'review'
    })
}

export const discountPage = async (req, res) => {
    res.render('productUI/discounts', {
        title: 'Discounts',
        page: 'discount'
    })
}

export const findSimilarPage = async (req, res) => {
    res.render('productUI/find-similar', {
        title: 'Find similar',
        page: 'find-similar'
    })
}

export const contactPage = async (req, res) => {
    res.render('productUI/contact', {
        title: 'Contact',
        page: 'contact'
    })
}