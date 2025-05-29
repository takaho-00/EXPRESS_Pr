//ルーティング（expressを呼び出して、expressのメソッドを活用）
var express = require('express');
var router = express.Router();

//prismモジュール呼び出し
const ps = require('@prisma/client');
const { get } = require('./users');
const { route } = require('./users');
const prisma = new ps.PrismaClient();


/* GET users listing. */
router.get('/', (req, res, next) => {
  const id = +req.query.id;
  if (!id) {
    //idがクエリ文にない時
   prisma.user.findMany().then( (users) => {
      const data = {
        title: 'Users/index',
        content: users,
      }
      res.render('users/index', data);
    });
  } else {
    //idがクエリ文にあるとき
    prisma.user.findMany({
      where: { id: { lte: id }  }
    }).then( (usrs) => {
      var data = {
        title: 'Users/index',
        content: usrs,
      }
      res.render('users/index', data);
    });
  }
});

/* GET find listing. */
router.get('/find', (req, res, next) => {
  const name = req.query.name;
  prisma.user.findMany({
    where: {name: {contains: name} }
  }).then((usrs) => {
    var data = {
      title: 'users/find',
      content: usrs,
    }
    res.render('users/index', data);
  });
});

// GET AND listening
router.get('/and', (req, res, next) => {
  const min = +req.query.min;
  const max = +req.query.max;
  prisma.user.findMany({
    where: {
      AND:[
        {age: {gte: min}},
        {age: {lte: max}}
      ]
    }
  }).then( (usrs) => {
  var data = {
    title: 'user/and',
    content: usrs
   }
   res.render('users/index', data);
  });
});


//GET OR listening
router.get('/or', (req, res, next) => {
  const name = req.query.name;
  const mail = req.query.mail;
  prisma.user.findMany( {
    where: {
      OR:[
        {name: {contains: name}},
        {name: {contains: mail}}
      ]
    }
   }).then( usrs => {
    var data = {
      title:'user/or',
      content: usrs
    }
    res.render('users/index', data);
   });
});

//addアクセス時
// GET（初期画面)
router.get('/add', (req, res, next) => {
  const data = {
    title: 'user/add'
  }
  res.render('users/add', data);
});
//POST
router.post('/add', (req, res, next) => {
  prisma.User.create({
    data:{
      name: req.body.name,
      pass: req.body.pass,
      mail: req.body.mail,
      age: +req.body.age
    }
  })
  .then(() => {
    res.redirect('/users');
  });
});

//editアクセス時
router.get('/edit/:id', (req, res, next) => {
  const id = req.params.id;
  prisma.user.findUnique(
    { where: { id:+id }}
  ).then( usrs => {
    const data = {
      title: 'user/edit',
      user: usrs
    }; 
    res.render('users/edit', data);
  });
});

router.post('/edit', (req,res,next) => {
  const {id, name, pass, mail, age} = req.body;
  prisma.User.update({
    where: { id: +id },
    data:{
      name: name,
      mail: mail,
      pass: pass,
      age: +age
    }
  }).then(( ) => {
    res.redirect('/users');
  });
});


module.exports = router;
