const express = require('express');
const multer = require('multer');
const app = express();
const fs = require('fs');
var Tesseract = require('tesseract.js');

//middlewares
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

const PORT = process.env.PORT | 5000;

var Storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, __dirname + '/images');
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  }
});

var upload = multer({
  storage: Storage
}).single('image');
//route
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/upload', (req, res) => {
  console.log(req.file);
  upload(req, res, err => {
    if (err) {
      console.log(err);
      return res.send('Something went wrong');
    }

    var image = fs.readFileSync(
      __dirname + '/images/' + req.file.originalname,
      {
        encoding: null
      }
    );
    Tesseract.recognize(image)
      .progress(function(p) {
        console.log('progress', p);
      })
      .then(function(result) {

        //Regex to fetch prices >  (\s\d+\.\s[0-9][0-9]\n)|(\s\d+\.[0-9][0-9]\n)
        prices = result.text.match(/(\s\d+\.\s[0-9][0-9]\n)|(\s\d+\.[0-9][0-9]\n)/g) 
        products = result.text.match(/(\d{4,11}\s(.*)\s)|(\d{4,11}\s\w{0,5}?![0-9]\n)/g)
        res1 = {
          'product-names': products,
          'product-prices': prices,
          'number-of-products': products.length,
          'number-of-prices': prices.length,
        }
        res.send(res1);
      });
  });
});

app.get('/showdata', (req, res) => {});

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});
