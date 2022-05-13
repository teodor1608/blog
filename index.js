const express = require('express')
const mongoose = require('mongoose')
const expressLayouts = require('express-ejs-layouts')
const Article = require('./models/article')
const articleRouter = require('./routes/articles')
const userRouter = require('./routes/users')
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const User = require('./models/User')
require('./config/passport')(passport)
const app = express();

mongoose.connect('mongodb+srv://blogAppServer:blogAppServer123@cluster0.2o80b.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}))
app.use(session({
    secret: 'nusha',
    resave: true,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next()
})
app.use(methodOverride('_method'))

app.get('/', async (req, res)=>{
    if(!req.user){
        res.render('users/welcome')
    }else{
        const articles = await Article.find().sort({
            createdAt: 'desc'
        })
        res.render('articles/index', {articles: articles, user: req.user})
    }
})

app.use('/articles', articleRouter)
app.use('/users', userRouter)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`listening at ${PORT}`))