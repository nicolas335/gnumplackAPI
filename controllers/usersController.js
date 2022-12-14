const path = require('path');
const { validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const db = require('../database/models')

module.exports = {
    processRegister: (req, res) => {
        let errors = validationResult(req);
        if (req.fileValidationError) {
            let image = {
                param: 'imageUser',
                msg: req.fileValidationError,
            }
            errors.errors.push(image);
        }
        if (errors.isEmpty()) {
            let { name, lastName, email, pass, phoneNumber, city, gender } = req.body;
            db.Users.create({
                first_name: name,
                last_name: lastName,
                email: email,
                password: bcryptjs.hashSync(pass, 12),
                phoneNumber: phoneNumber,
                city: city,
                genders_id: gender == "Seleccione su género"? 1 : gender,
                image: req.file ? req.file.filename : "default-profile-image.jfif",
                categories_users_id: 1
            })
                .then(user => {
                    req.session.userLogin = {
                        first_name: name,
                        last_name: lastName,
                        email: email,
                        image: req.file ? req.file.filename : "default-profile-image.jfif",
                        categories_users_id: 1
                    }
                    res.cookie('recordar', req.session.userLogin, { maxAge: 1000 * 60 * 60 * 50 })
                })
                .then(iniciar => {
                    return res.status(200).json({
                        meta: {
                            path: `${req.protocol}://${req.get('host')}${req.originalUrl}`
                        },
                        msg: "El usuario ha sido registrado exitosamente!"
                    })
                })
                .catch(errors => res.status(500).json(errors))

        } else {

            return res.status(500).json({
                errors: errors.mapped(),
                old: req.body
            })
        }
    },
    processLogin: (req, res) => {
        let errors = validationResult(req)
        if (errors.isEmpty()) {
            const { email, recordame } = req.body
            db.Users.findOne({
                where: {
                    email
                }
            })
                .then(user => {
                    req.session.userLogin = {
                        id: user.id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        image: user.image,
                        categories_users_id: user.categories_users_id
                    }
                    if (recordame) {
                        res.cookie('recordar', req.session.userLogin, { maxAge: 1000 * 60 * 60 * 24 })
                    }
                    return res.status(200).json({
                        meta: {
                            path: `${req.protocol}://${req.get('host')}${req.originalUrl}`
                        },
                        msg: "Has sido logeado con exito!"
                    })
                })
                .catch(err => res.status(500).json(err))
        } else {
            return res.status(500).json({
                errors: errors.mapped(),
                old: req.body
            })
        }
    },
    profile: (req, res) => {
        db.Users.findOne({
            where: {
                email: req.session.userLogin.email,
            }
        })
        .then(user => {
            return res.json({
                meta: {
                    path: `${req.protocol}://${req.get('host')}${req.originalUrl}`
                },
                data: user 
            })
        })
        .catch(e => res.status(500).json({
            msg: "El perfil buscado no ha sido encontrado o no existe"
        }))
    },
    editUser: (req, res) => {

        db.Users.findOne({
            where: {
                id: req.session.userLogin.id,
            },
            include: [{
                all: true,
            }]
        })
            .then((user) => {
                return res.json({
                    meta: {
                        path: `${req.protocol}://${req.get('host')}${req.originalUrl}`  
                    },
                    data: user
                });
            }).catch((error) => res.status(500).json(error));

    },
    processEdit: (req, res) => {
        let errors = validationResult(req);

        if (req.fileValidationError) {
            let image = {
                param: 'imageUser',
                msg: req.fileValidationError,
            }
            errors.errors.push(image);
        }
        if (errors.isEmpty()) {
            let { first_name, last_name, email, phoneNumber, city} = req.body;
        
            db.Users.findOne({
                where: {
                    id: req.session.userLogin.id,
                }
            })
            .then(user => {
            db.Users.update({
            first_name: first_name,
            last_name: last_name,
            email: email,   
            phoneNumber: +phoneNumber,
            city: city,
            updatedAt: new Date,
            image: req.file ? req.file.filename : user.image,
        },{
            where: {id: req.session.userLogin.id}
        }
        )
        .then(usuario => res.status(200).json({
            data: usuario,
            meta: {
                path: `${req.protocol}://${req.get('host')}${req.originalUrl}`  
            }
        }))
        .catch(error => res.status(500).json(error))
    })} else {
        db.Users.findOne({
            where: {
                id: req.session.userLogin.id,
            }
        })
        .then(user => {
            res.json({
                user,
                errors: errors.mapped()
            })
        })
    }
    }, 


    logout: (req, res) => {
        req.session.destroy();
        if (req.cookies.recordar) {
            res.cookie('recordar', '', { maxAge: -1 })
        }


        return res.json({
            msg: "Sesión cerrada"
        })
    },



}
