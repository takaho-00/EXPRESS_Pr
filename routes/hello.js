const express = require('express');
const router = express.Router();

const sqlite3 = require('sqlite3');
const { route } = require('./hello');
const { check, validationResult } = require('express-validator');


//データオブジェクトの取得（ファイル取得）
const db = new sqlite3.Database('mydb.db');


//indexアクセスの処理
router.get('/', (req,res,next) => {
  
  db.serialize( () => {
    var rows = ""; //rows変数
    //mydbファイルの中のmydataというテーブルから取得
    db.each("select * from mydata" , (err, row)  => {
      if(!err){
          rows += "<tr><th>" + row.id + "</th><td>" + row.name + "</td></tr>";
        }
    }, (err, count) => { 
      if (!err){
        var data = {
          title: 'Hello',
          content: rows
        };
        res.render('hello/index', data);
      }
    });
  });
});

//addアクセス時の処理
//data変数設定(初期画面)


router.get("/add", (req,res,next) => {
    var data = {
    title: 'Hello/Add',
    content: '新しいレコードを入力:',
    form: {name:'', mail:'', age:0}
  }
  res.render('hello/add', data);
});
// add実行
router.post('/add', [
    check('name', 'NAME は必ず入力してください。').notEmpty(),
    check('mail', 'MAIL はメールアドレスを記入してください。').isEmail(),
    check('age', 'AGE は年齢（整数）を入力してください。').isInt(),    
  ] ,(req, res,next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
      var result = '<ul class="text-danger">';
        var result_arr = errors.array();
        for(var n in result_arr){
          result += '<li>' + result_arr[n].msg + '</li>'
        }
      result += ' </ul> ';
      var data = {
        title: 'hello/Add',
        content: result,
        form: req.body,
      }
      res.render("hello/add", data);
    } else {
        const nm = req.body.name;
        const ml = req.body.mail;
        const ag = req.body.age;
        db.serialize(() => {
          db.run('insert into mydata ( name,mail,age) values (?,?,?)', nm, ml, ag);
        });
        res.redirect('/hello');
      } 
});

//showアクセス時の処理
router.get('/show', (req, res, next) => {
  const id = req.query.id;
  db.serialize( () => {
    const q = " select * from mydata where id = ? ";
    db.get(q, [id], (err, row)=> {
      if (!err) {
        var data= {
          title: 'Hello/show',
          content: 'id =' + id  +' のレコード： ',
          mydata: row,
        }
        res.render('hello/show', data);
      }
    });
  } );
});

//editアクセス時
// 最初の編集画面
router.get("/edit", (req,res,next) => {
  const id = req.query.id;
  db.serialize( () => {
    const q = "select * from mydata where id = ?";
    db.get(q, [id], (err, row) => {
      if( !err ){
        var data = {
          title: 'hello/edit',
          content: 'id = ' + id +'のレコードを編集',
          mydata: row,
        }
        //htmlとしてレンダリングし画面に表示
        res.render("hello/edit", data);
      }
    });
  });
});
// フォームで送られてきたデータを変更するだけなので、runしてredirectして画面を元に戻している。
router.post("/edit", (req,res,next) => {
  const id = req.body.id;
  const nm = req.body.name;
  const ml = req.body.mail;
  const ag = req.body.age;
  const q = "update mydata set name = ?, mail=?, age=? where id = ?";
  db.serialize( () => {
    db.run(q, nm, ml, ag, id);
  });
  res.redirect('/hello');
});

// deleteアクセス時(表示)
router.get('/delete', (req, res, next) => {
  const id = req.query.id;
  db.serialize(() => {
    const q = "select * from mydata where id = ?";
    db.get(q, [id], (err,row) => {
      if(!err){
        var data = {
          title: 'hello/delete',
          content: 'id = ' + id + 'のレコードを削除:',
          mydata: row
        }
        res.render("hello/delete" , data);
      }
    });
  });
});
// delete実行
router.post('/delete', (req,res,next) => {
  const id = req.body.id;
  db.serialize(() => {
    const q = "delete from mydata where id = ?";
    db.run(q, id);
  });
  res.redirect("/hello");
});

//findアクセス時
router.get('/find', (req,res,next) => {
  db.serialize(() => {
    db.all("select * from mydata", (err, rows) => {
      if(!err){
        var data = {
          title: 'hello/find',
          find: '',
          content: '検索条件を入力してください。',
          mydata: rows,
        };
        //appjsのプログラムとして読み込まれているので、appjsからの相対パスになる
        res.render('hello/find', data);
      }
    });
  });
});

router.post('/find', (req, res, next)=> {
  var find = req.body.find;
  db.serialize(() => {
    var q = "select * from mydata where";
    db.all(q + find,[], (err, rows) => {
      if(!err){
        var data = {
          title: "hello/find",
          find: find,
          content: '検索条件' + find,
          mydata: rows,
        }
        res.render('hello/find', data);
      }
    });
  });
});

module.exports = router;