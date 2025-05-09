export const pageNotFound = async (req, res) => {
    res.render('errors/error-404', {
        title: 'Page Not Found'
    })
}