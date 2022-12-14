var express = require('express');
var router = express.Router();


const {product, detail, search, create, history, update, trash, destroy} = require('../controllers/productsController');
const adminCheck = require('../middlewares/adminCheck');
const upload = require('../middlewares/multerProducts');
const productValidator = require('../validations/productValidation');
const notFound = require('../middlewares/notFound');


router.get('/', product);
router.get('/:id', detail);
router.get('/search', search);
router.get('/create'/* ,adminCheck */, create);
router.get('/listDeleted'/* ,adminCheck */,history);

router.put('/edit/:id'/* ,adminCheck */,notFound,upload.single('image'),productValidator,update);
router.put('/restored/:id'/* ,adminCheck */,restore);

router.post('/create'/* ,adminCheck */,upload.single('image'),productValidator,create);

 
router.delete('/:id'/* ,adminCheck */,notFound, trash);
router.delete('/destroy/:id'/* ,adminCheck */,destroy); /* permanent */

module.exports = router;