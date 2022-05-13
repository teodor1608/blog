const express = require('express')
const Article = require('./../models/article')
const res = require('express/lib/response')
const req = require('express/lib/request')
const { route } = require('express/lib/application')
const { ensureAuthenticated } = require('../config/auth')
const router = express.Router()

router.get('/new',ensureAuthenticated, async (req, res) => {
    res.render('articles/new', { article: new Article() })
})

router.get('/edit/:id',ensureAuthenticated, async (req, res) => {
    const article = await Article.findById(req.params.id)
    res.render('articles/edit', { article: article })
})

router.get('/:slug',ensureAuthenticated, async (req, res) => {
    const article = await Article.findOne({ slug: req.params.slug })
    if(article == null) res.redirect('/')
    res.render('articles/show', {article: article, _user: req.user})
})

router.post('/', ensureAuthenticated, async (req, res) => {
    let article = new Article({
        title: req.body.title,
        description: req.body.description,
        markdown: req.body.markdown,
        userCreated: req.user.id
    })
    try{
        article = await article.save()
        res.redirect(`/articles/${article.slug}`)
    }catch(e){
        console.log(e)
        res.render('articles/new', { article: article })
    }
})

router.post('/', async (req, res, next) => {
    req.article = new Article()

    next()
}, saveArticleAndRedirect('new'))

router.put('/:id', async (req, res, next) => {
    req.article = await Article.findById(req.params.id)
    next()
}, saveArticleAndRedirect('edit'))

router.delete('/:id',ensureAuthenticated, async (req, res) => {
    await Article.findByIdAndDelete(req.params.id)
    res.redirect('/')
})

function saveArticleAndRedirect(path){
    return async (req, res) => {
        let article = req.article
        article.title = req.body.title
        article.description = req.body.description
        article.markdown = req.body.markdown
        article.userCreated = req.user.id
        try{
            article = await article.save()
            res.redirect(`/articles/${article.slug}`)
        }catch(e){
            res.render(`articles/${path}`, { article: article })
        }
    }
}

module.exports = router