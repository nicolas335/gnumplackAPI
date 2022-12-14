const db = require('../database/models');
const {Op, where} = require('Sequelize');
const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

module.exports={
    product:(req,res)=>{

        let placaYeso = db.Products.findAll({
            where: {
                categories_products_id: 1,
            }
        })
        let placaLaminado = db.Products.findAll({
            where: {
                categories_products_id: 2,
            }
        })
        let placaFibras = db.Products.findAll({
            where: {
                categories_products_id: 3,
            }
        })
        let placaMadera = db.Products.findAll({
            where: {
                categories_products_id: 4,
            }
        })
        let placaCemento = db.Products.findAll({
            where: {
                categories_products_id: 5,
            }
        })
        let products = db.Products.findAll()
        
        Promise.all([placaYeso, placaLaminado, placaFibras,placaMadera,placaCemento, products])
            .then(([placaYeso, placaLaminado, placaFibras,placaMadera,placaCemento,products]) => {
                let array = [
                    placaYeso,
                    placaLaminado,
                    placaFibras,
                    placaMadera,
                    placaCemento,
                    products
                ]
                let response = {
                    status: 200,
                    meta: {
                        length: array.length,
                        path: `${req.protocol}://${req.get('host')}${req.originalUrl}`
                    },
                    data: array
                }
                return res.status(200).json(response)
            })
        .catch(err => res.status(500).json(err))
            
    },
    detail:(req,res)=>{
        db.Products.findOne({
            where: {name: { [Op.substring]: req.query.name }}
        })
        .then(product => {
            return res.status(200).json({ 
                status: 200,
                meta: {
                    path: `${req.protocol}://${req.get('host')}${req.originalUrl}`
                },
                data: product
            })
        })
        .catch(err => res.status(500).json(err))
        
   },
   search: (req,res) => {
    let search = req.query.search

    db.Products.findAll({
        where: {
            [Op.or]: [
                {name: {[Op.substring]: search}},
                {description: {[Op.substring]: search}},
                {qualities: {[Op.substring]: search}},
                {advantages: {[Op.substring]: search}}
            ]
        }
    })
    .then(result => {
        
        res.status(200).json({
            meta: {
                path: `${req.protocol}://${req.get('host')}${req.originalUrl}`
            },
            data:result,
            search
        })
    })
    .catch(err => res.status(500).json(err))

   },
   create: (req, res) => {
    let errors = validationResult(req)
    if (req.fileValidationError) {
        let image = {
            param: 'image',
            msg: req.fileValidationError,
        }
        errors.errors.push(image);
    }

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
            image: req.file.filename ? req.file.filename : 'default-product-image.png'
      
      }) .then(p => {  
            let response = {
                status: 201,
                meta: {
                    length: p.length,
                    path: `${req.protocol}://${req.get('host')}${req.originalUrl}`
                },
                data: p
            }
            return res.status(200).json(response)
            
             
         
        })
        .catch(err => res.status(500).json(err))

    } else {
        let ruta = (dato) => fs.existsSync(path.join(__dirname, '..', 'public', 'img', 'products', dato))
        if (ruta(req.file.filename) && (req.file.filename !== "default-product-image.png")) {
            fs.unlinkSync(path.join(__dirname, '..', 'public', 'img', 'products', req.file.filename))
        }
            
        /* quizas borrar (hasta ---)*/
        let categories_products = db.Categories_products.findAll()
        let conditions = db.Conditions.findAll()
        Promise.all([categories_products,conditions])
        .then(([categories_products,conditions]) => {
            let categories_products = categories_products
            let conditions = conditions
        })
        /* --- */
        return res.json({
            errors: errors.mapped(),
            old: req.body,
            categories_products,
            conditions
        })
    }
    },
    update: (req, res) => {
        let errors = validationResult(req)
        if (req.fileValidationError) {
            let image = {
                param: 'image',
                msg: req.fileValidationError,
            }
            errors.errors.push(image);
        }
        let idParams  = +req.params.id

        if (errors.isEmpty()) {

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
                updatedAt: new Date,
            },{
                where: {
                    id : idParams
                }
            })
            Promise.all([oldProduct,updatedProducto])
            .then(([oldProduct,updatedProducto]) => {    
                
                if (req.file) {
                    db.Products.update({
                        image: req.file.filename
                    }, {
                        where: {id: idParams}
                    })
                    .then(resultado => {
                        let ruta = (dato) => fs.existsSync(path.join(__dirname, '..', 'public', 'img', 'products', dato))
                        if (ruta(req.file.filename) && (oldProduct.image !== "default-product-image.png")) {
                            fs.unlinkSync(path.join(__dirname, '..', 'public', 'img', 'products', oldProduct.image))
                        }
                    })
                }
                return res.stratus(200).json({
                    meta: {
                        path: `${req.protocol}://${req.get('host')}${req.originalUrl}`
                    },
                    data: "Producto editado con exito",
                    updatedProducto
                })
            })
            .catch(error => res.status(500).json(error))

        } else {
            let ruta = (dato) => fs.existsSync(path.join(__dirname, '..', 'public', 'img', 'products', dato))
            if (ruta(req.file.filename) && (req.file.filename !== "default-product-image.png")) {
                fs.unlinkSync(path.join(__dirname, '..', 'public', 'img', 'products', req.file.filename))
            }
            

            let categories_products = db.Categories_products.findAll()
            let conditions = db.Conditions.findAll()
            let product = db.Products.findOne({
                where: {
                    id : idParams
                },
                include: [{
                    all:true
                }]
            })


            Promise.all([product,categories_products,conditions])
            .then(([product,categories_products,conditions]) => {
                res.json({
                    producto: product,
                    categories_products,
                    conditions,
                    errors:errors.mapped()
                })
            })
            .catch(error => res.status(500).json(error))
        }
    },
    trash:(req,res)=>{
        
        let idParams = +req.params.id
        db.Products.findOne({
            where: {id: idParams},
            include: [{
                all:true
            }] 
        })
        .then(producto => {
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
                    where: {id: idParams}
                })
            })
            .then(producto => {
                res.status(200).json({
                    meta: {
                        path: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
                        status: 200
                    },
                    msg:`El producto "${producto.name}" ha sido ubicado en el historial de productos exitosamente`
                })
            })
        })
        .catch(error => res.status(500).json(error))
        
    },
    history: (req,res) => {
        db.Removed_products.findAll()
        .then(productsRemoved => {
            return res.status(200).json({
                meta: {
                    path: `${req.protocol}://${req.get('host')}${req.originalUrl}`
                },
                data:productsRemoved
            })
        })
        .catch(err => res.status(500).json(err))
    },
    restore: (req,res) => {
        let idParams = +req.params.id
        
        db.Removed_products.findOne({
            where: {id: idParams},
            include: [{
                all:true
            }] 
        })
        .then(producto => {
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
                    where: {id: idParams}
                })
            })
            .then(p => {
                res.status(200).json({
                    meta: {
                        path: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
                        status:200
                    },
                    msg: `El producto ${p.name} ha sido restaurado exitosamente`
                })
            })
        })
        .catch(error => res.status(500).json(error))
        
    },
    destroy: (req,res) => {
        let idParams = +req.params.id
        db.Removed_products.findByPk(idParams)
        .then(productRemoved => {
            let ruta = (dato) => fs.existsSync(path.join(__dirname, '..', 'public', 'img', 'products', dato))
            if (ruta(productRemoved.image) && (productRemoved.image !== "default-product-image.png")) {
                fs.unlinkSync(path.join(__dirname, '..', 'public', 'img', 'products', productRemoved.image))
            }
        })
        .then(r => {
            db.Removed_products.destroy({
                where: {id:idParams}
            })
            .then(p => {
                let response = {
                    meta: {
                        status: 202,
                        path: `${req.protocol}://${req.get('host')}${req.originalUrl}`
                    },
                    msg: "Producto eliminado exitosamente"
                }
                return res.status(200).json(response)
            })
        })
        .catch(e => res.status(500).json(e))        
    }
}