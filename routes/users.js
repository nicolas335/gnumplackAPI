const express = require('express');
const router = express.Router();

let {processLogin,processRegister,profile,logout,editUser,processEdit} = require ('../controllers/usersController');

const noLogin = require('../middlewares/noLogin')
const loginCheck = require('../middlewares/loginCkeck')
const validationsRegister = require('../validations/registerValidations');
const loginValidator = require('../validations/loginValidation');
const uploadFile = require('../middlewares/multerRegister');
const editUserValidation =require('../validations/editUserValidation');


router.post('/signin',loginCheck, uploadFile.single('imageUser'), validationsRegister ,processRegister);

router.post('/login',loginCheck,loginValidator,processLogin);

router.get('/profile',noLogin,profile);
router.delete('/logout',noLogin,logout);

router.get('/editUser',noLogin, editUser);
router.put('/editUser',noLogin, uploadFile.single('imageUser'),editUserValidation,processEdit);

module.exports = router;