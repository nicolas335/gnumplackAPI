var express = require('express');
var router = express.Router();

const {list,create,store,edit,update,trash,history,restore,destroy} = require('../controllers/adminController')
const adminCheck = require('../middlewares/adminCheck');
const upload = require('../middlewares/multerProducts');
const productValidator = require('../validations/productValidation');
const notFound = require('../middlewares/notFound');

router.get('/list'/* ,adminCheck */, list);

router.get('/create'/* ,adminCheck */, create);
router.post('/create'/* ,adminCheck */,upload.single('image'),productValidator,store);

router.get('/edit/:id'/* ,adminCheck */,notFound, edit);
router.put('/edit/:id'/* ,adminCheck */,notFound,upload.single('image'),productValidator,update)

router.delete('/:id'/* ,adminCheck */,notFound, trash);

router.get('/listDeleted'/* ,adminCheck */,history)
router.put('/restored/:id'/* ,adminCheck */,restore)
router.delete('/destroy/:id'/* ,adminCheck */,destroy)

module.exports = router;