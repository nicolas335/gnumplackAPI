const db = require('../database/models');
const { Op, where } = require('Sequelize');
const { validationResult } = require('express-validator');
const fs = require('fs')

module.exports = {
    list: (req, res) => {
        db.Products.findAll()
        .then(products => {
                //return res.send(products)
                let response = {
                    meta: {
                        status: 200,
                        length: products.length,
                        link: `${req.protocol}://${req.get('host')}${req.originalUrl}`
                    },
                    data: products
                }
                res.status(200).json(response)
            })
            .catch(err => res.status(500).json('Hubo un error al acceder a la lista de productos'))
    },

    create: (req, res) => {
        let categories_products = db.Categories_products.findAll()
        let conditions = db.Conditions.findAll()
        Promise.all([categories_products, conditions])
            .then(([categories_products, conditions]) => {
                let response = {
                    meta: {
                        status: 200,
                        link: `${req.protocol}://${req.get('host')}${req.originalUrl}`
                    },
                    data: {
                        categories_products,
                        conditions
                    }
                }
                res.status(200).json(response)
            })
            .catch(err => res.status(500).json('Sucesió un error al acceder a la vista'))
    },

    store: (req, res) => {      /* REVISAR, funciona pero tira error 500 del catch*/
        let errors = validationResult(req)
        /* if (req.fileValidationError) {
            let image = {
                param: 'image',
                msg: req.fileValidationError,
            }
            errors.errors.push(image);
        } */

        if (errors.isEmpty()) {
            let { name, description, dimensions, category, condition, stock, price, qualities, discount, advantage } = req.body;
            db.Products.create({
                name: name,
                description: description,
                dimensions: dimensions,
                categories_products_id: category,
                conditions_id: condition,
                stock: +stock,
                price: +price,
                discount: +discount,
                qualities: qualities,
                advantages: advantage,
                image: req.file ? req.file.filename : 'default-product-image.png'

            })
                .then(respuesta => {
                    let response = {
                        meta: {
                            status: 200,
                            msg: 'Producto creado con éxito',
                            link: `${req.protocol}://${req.get('host')}${req.originalUrl}`
                        },
                        data: respuesta
                    }
                    res.status(200).json(response)
                })
                .catch(err => res.status(500).json(err))           
            
        } else {
            /* let ruta = (dato) => fs.existsSync(path.join(__dirname, '..', 'public', 'img', 'products', dato))
            if (ruta(req.file.filename) && (req.file.filename !== "default-product-image.png")) {
                fs.unlinkSync(path.join(__dirname, '..', 'public', 'img', 'products', req.file.filename))
            } */

            let categories_products = db.Categories_products.findAll()
            let conditions = db.Conditions.findAll()
            Promise.all([categories_products, conditions])
                .then(([categories_products, conditions]) => {
                    let response = {
                        meta: {
                            status: 500,
                            msg: 'Hubo problemas con las validaciones al crear el producto',
                            link: `${req.protocol}://${req.get('host')}${req.originalUrl}`
                        },
                        data: {
                            errors: errors.mapped(),
                            old: req.body,
                            categories_products,
                            conditions
                        }
                    }
                    res.status(500).json(response)
                })
                .catch(err => res.status(500).json(err))
        }
    },

    edit: (req, res) => {
        let product = db.Products.findOne({
            where: {
                id: req.params.id
            },
            include: [{
                all: true
            }]
        })
        let categories_products = db.Categories_products.findAll()
        let conditions = db.Conditions.findAll()
        Promise.all([product, categories_products, conditions])
            .then(([product, categories_products, conditions]) => {
                let array = [
                    {
                        product,
                        categories_products,
                        conditions
                    }
                ]
                let response = {
                    meta: {
                        status: 200,
                        link: `${req.protocol}://${req.get('host')}${req.originalUrl}`
                    },
                    data: array
                }
                res.status(200).json(response)
            })
            .catch(err => res.status(500).json('No se logró acceder a la información'))
    },

    update: (req, res) => {
        /* let errors = validationResult(req)
        if (req.fileValidationError) {
            let image = {
                param: 'image',
                msg: req.fileValidationError,
            }
            errors.errors.push(image);
        }
        
        if (errors.isEmpty()) { */
        let idParams = +req.params.id

            let oldProduct = db.Products.findByPk(idParams)
            let updatedProducto = db.Products.update({
                name: req.body.name,
                description: req.body.description,
                dimensions: req.body.dimensions,
                discount: +req.body.discount,
                price: +req.body.price,
                qualities: req.body.qualities,
                stock: +req.body.stock,
                categories_products_id: +req.body.category,
                condition_id: +req.body.condition,
                image: req.file? req.file.filename : 'default-product-image.png',
                updatedAt: new Date,
            }, {
                where: {
                    id: idParams
                }
            })
            Promise.all([oldProduct, updatedProducto])
                .then(([oldProduct, updatedProducto]) => {

                    /* if (req.file) {
                        db.Products.update({
                            image: req.file.filename
                        }, {
                            where: { id: idParams }
                        })
                            .then(resultado => {
                                let ruta = (dato) => fs.existsSync(path.join(__dirname, '..', 'public', 'img', 'products', dato))
                                if (ruta(req.file.filename) && (oldProduct.image !== "default-product-image.png")) {
                                    fs.unlinkSync(path.join(__dirname, '..', 'public', 'img', 'products', oldProduct.image))
                                }
                            })
                    } */
                    let response = {
                        meta: {
                            status: 200,
                            link: `${req.protocol}://${req.get('host')}${req.originalUrl}`
                        },
                        data: 'Producto actualizado con éxito'
                    }
                    res.status(200).json(response)
                })
                .catch(err => res.status(500).json(err/* 'No se pudo actualizar los datos del producto' */))

        /* } else {
            let ruta = (dato) => fs.existsSync(path.join(__dirname, '..', 'public', 'img', 'products', dato))
            if (ruta(req.file.filename) && (req.file.filename !== "default-product-image.png")) {
                fs.unlinkSync(path.join(__dirname, '..', 'public', 'img', 'products', req.file.filename))
            }

            let categories_products = db.Categories_products.findAll()
            let conditions = db.Conditions.findAll()
            let product = db.Products.findOne({
                where: {
                    id: idParams
                },
                include: [{
                    all: true
                }]
            })
            Promise.all([product, product, categories_products, conditions])
                .then(([product, categories_products, conditions]) => {
                    let response = {
                        meta: {
                            status: 500,
                            msg: 'Hubo problemas con las validaciones al editar el producto',
                            link: `${req.protocol}://${req.get('host')}${req.originalUrl}`
                        },
                        data: {
                            producto: product,
                            categories_products,
                            conditions,
                            errors: errors.mapped()
                        }
                    }
                    res.status(500).json(response)

                })
                .catch(err => res.status(500).json('No se pudo actualizar los datos del producto'))
        } */

    },

    trash: (req, res) => {
        let idParams = +req.params.id
        db.Products.findOne({
            where: { id: idParams },
            include: [{
                all: true
            }]
        })
            .then(producto => {
                // Agrego el producto al historial
                db.Removed_products.create({
                    name: producto.name,
                    description: producto.description,
                    dimensions: producto.dimensions,
                    discount: producto.discount,
                    price: producto.price,
                    qualities: producto.qualities,
                    advantages: producto.advantages,
                    image: producto.image,
                    stock: producto.stock,
                    categories_products_id: producto.categoryProduct.id,
                    conditions_id: producto.condition.id,
                    createdAt: producto.createdAt,
                    updatedAt: new Date
                })
                    .then(historial => {
                        db.Products.destroy({
                            where: { id: idParams }
                        })
                    })
                    .then(producto => {
                        let response = {
                            meta: {
                                status: 200,
                                link: `${req.protocol}://${req.get('host')}${req.originalUrl}`
                            },
                            data: 'Producto eliminado con éxito'
                        }
                        res.status(200).json(response)
                    })
            })
            .catch(err => res.status(500).json('No se legró eliminar el producto'))
    },

    history: (req, res) => {
        db.Removed_products.findAll()
            .then(result => {
                let response = {
                    meta: {
                        status: 200,
                        length: result.length,
                        link: `${req.protocol}://${req.get('host')}${req.originalUrl}`
                    },
                    data: result
                }
                res.status(200).json(response)
            })
            .catch(err => res.status(500).json('No se logró acceder a la información'))
    },

    restore: (req, res) => {
        let idParams = +req.params.id

        db.Removed_products.findOne({
            where: { id: idParams },
            include: [{
                all: true
            }]
        })
            .then(producto => {
                //return res.send(producto)
                db.Products.create({
                    name: producto.name,
                    description: producto.description,
                    dimensions: producto.dimensions,
                    discount: producto.discount,
                    price: producto.price,
                    qualities: producto.qualities,
                    advantages: producto.advantages,
                    image: producto.image,
                    stock: producto.stock,
                    categories_products_id: producto.categoryProduct.id,
                    conditions_id: producto.condition.id,
                    createdAt: producto.createdAt,
                    updatedAt: new Date
                })
                    .then(eliminar => {
                        db.Removed_products.destroy({
                            where: { id: idParams }
                        })
                    })
                    .then(redireccion => {
                        let response = {
                            meta: {
                                status: 200,
                                link: `${req.protocol}://${req.get('host')}${req.originalUrl}`
                            },
                            data: 'Producto restaurado con éxito'
                        }
                        res.status(200).json(response)
                    })
            })
            .catch(err => res.status(500).json('Hubo un problema al restaurar el producto'))
    },

    destroy: (req, res) => {
        let idParams = +req.params.id
        db.Removed_products.findByPk(idParams)
            .then(productRemoved => {
                /* let ruta = (dato) => fs.existsSync(path.join(__dirname, '..', 'public', 'img', 'products', dato))
                if (ruta(productRemoved.image) && (productRemoved.image !== "default-product-image.png")) {
                    fs.unlinkSync(path.join(__dirname, '..', 'public', 'img', 'products', productRemoved.image))
                } */

                db.Removed_products.destroy({
                    where: { id: idParams }
                })
                    .then(redireccion => {
                        let response = {
                            meta: {
                                status: 200,
                                link: `${req.protocol}://${req.get('host')}${req.originalUrl}`
                            },
                            data: 'Producto eliminado totalmente de la base de datos'
                        }
                        res.status(200).json(response)
                    })
            })
            .catch(err => res.status(500).json('No se logró eliminar el producto con éxito'))
    }
}