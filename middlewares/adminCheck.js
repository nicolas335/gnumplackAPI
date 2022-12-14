module.exports = (req,res,next) => {
    if ((+req.session.userLogin.categories_users_id) === 2 && req.session.userLogin) {
            return next()
        }
    else{
        return res.status(401)
    }

}