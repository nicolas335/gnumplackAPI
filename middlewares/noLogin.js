module.exports = (req,res,next) => {
    if (req.session.userLogin){
        return next()
    } else {
        return res.status(401).json({
            msg:"Tienes que logearte para poder acceder"
        })
    }
}