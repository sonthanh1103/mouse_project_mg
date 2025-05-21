export const pageNotFound = async (req, res) => {
    res.render('errors/error-404', {
        title: 'Page Not Found'
    })
}

export const dashboardPage = async (req, res) => {
    res.render('home/dashboard', {
        title: 'Dashboard',
        page: 'dashboard'
    })
}

export const comparePage = async (req, res) => {
    res.render('home/compare', {
        title: 'Compare',
        page: 'compare'
    })
}

export const databasePage = async (req, res) => {
    res.render('home/database', {
        title: 'Database',
        page: 'database'
    })
}

export const reviewPage = async (req, res) => {
    res.render('home/reviews', {
        title: 'Reviews',
        page: 'reviews'
    })
}

export const discountPage = async (req, res) => {
    res.render('home/discounts', {
        title: 'Discounts',
        page: 'discounts'
    })
}

export const findSimilarPage = async (req, res) => {
    res.render('home/find-similar', {
        title: 'Find similar',
        page: 'find-similar'
    })
}

export const contactPage = async (req, res) => {
    res.render('home/contact', {
        title: 'Contact',
        page: 'contact'
    })
}