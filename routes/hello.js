const express = require('express');
const router = express.Router();
const http = require('http');
const parseString = require('xml2js').parseString;

//get
router.get('/', (req,res,vext) => {
  var opt = {
    host: 'news.google.com',
    port: 443,
    path: '/rss?hl=ja&ie=UTF-8&or=UTF-8&gl=jp&ceid=JP:ja'
  };

  http:get(opt, (res2) => {
    var body ='';
    res2.on('data', (data) => {
      parseString(body.trim(), (err, result) => {
        console.log(result);
        var data = {
          title: 'Google News',
          content: result.rss.channel[0].itm
        };
        res.render('hello', data);
      });
     });
    });
  });

module.exports = router;