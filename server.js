if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express();
const bodyParser = require ('body-parser');

const methodOverride = require('method-override');

const bcrypt = require('bcrypt');
const passport = require('passport')
const session = require('express-session')
const flash = require('express-flash')

app.use(express.urlencoded({limit:'50mb'}))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views')
app.use(express.static('public'))
app.use(methodOverride('_method'))

app.use(bodyParser.urlencoded({limit: '10mb', extended:false}));

const mongoose = require ('mongoose');
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection;
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))



const indexRouter = require('./4')
app.use('/', indexRouter)





let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("server running Successfully");
});