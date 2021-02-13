const express = require('express');
const router = express.Router();
const Article = require('./model/article');
const Category = require('./model/category');
const Author = require('./model/author');

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

const bcrypt = require('bcrypt');
const passport = require('passport')



const initializePassport = require('./route/passport-config')
initializePassport(
  passport,
  email => Author.findOne({email: email}),
  id => Author.findOne({id: id})
)

router.get('/login', checkNotAuthenticated, (req,res) => {
  res.render('login')
})

router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

router.get('/register', checkNotAuthenticated, (req,res) => {
  res.render('register')
})

router.post('/register', checkNotAuthenticated, async (req,res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const authors = new Author({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    authors.save()
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

router.delete('/logout', (req,res) => {
  req.logOut()
  res.redirect('/login')
})


//----------------------------------------------------------------------


//Index Page Route
router.get('/', checkAuthenticated, async (req, res) => {
  let articles = []
  try {
    articles = await Article.find().populate('category').exec()
    
  } catch {
    articles = []
  }
    res.render('index', {articles: articles})
})




//All Category
router.get('/category', checkAuthenticated, async (req, res) => {
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try {
    const category = await Category.find(searchOptions)
    res.render('category', {
      category: category,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})


// New Category Route
router.get('/category/new', checkAuthenticated, (req, res) => {
  res.render('category-new', { category: new Category() })
})


// Create Category Route - Post from Form
router.post('/category', checkAuthenticated, async (req, res) => {
  const category = new Category({
    name: req.body.name
  })
  try {
    const newCategory = await category.save()
    res.redirect(`category/${newCategory.id}`)
  } catch {
    res.render('category-new', {
      category: category,
      errorMessage: 'Error creating Category'
    })
  }
})

//Single Category show
router.get('/category/:id', checkAuthenticated, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    const articles = await Article.find({ category: category.id })
    res.render('category-show', {
      category: category,
      articlesByCategory: articles
    })
  } catch {
    
    res.redirect('/')
  }
})

//Delete Category
router.delete('/category/:id', checkAuthenticated, async (req, res) => {
  let category
  try {
    category = await Category.findById(req.params.id)
    await category.remove()
    res.redirect('/category')
  } catch {
    if (author == null) {
      res.redirect('/')
    } else {
      res.redirect(`/category/${category.id}`)
    }
  }
})




//----------------------------------------------------------------------



//Article Route - Search
router.get('/articles', checkAuthenticated, async (req,res) => {
  let query = Article.find()
  if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  } 
  
  try {
    const articles = await query.exec()
    res.render('articles', {
      category: category,
      author: author,
      articles: articles,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

//Article Post
router.post('/articles', checkAuthenticated, async (req, res) => {
  const article = new Article({ 
    title: req.body.title,
    category: req.body.category,
    author: req.body.author,
    content: req.body.content,
    publishDate: new Date(req.body.publishDate)
  })
  saveCover(article, req.body.cover)

  try {
    const newArticle = await article.save()
    res.redirect(`articles/${newArticle.id}`)
  } catch {
    res.redirect('/articles')
  }
})

//Article Add
router.get('/articles/new', checkAuthenticated, async (req,res) => {
  renderNewPage(res, new Article())
})



//Article New - One Article
router.get('/articles/:id', checkAuthenticated, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate('category').exec()
    res.render('show', {
      article: article
    })
  } catch {
    res.redirect('/')
  }
})

//Article Edit
router.get('/articles/:id/edit', checkAuthenticated, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
    renderEditPage(res, article)
  } catch {
    res.redirect('/')
  }
})


//Update article Route
router.put('/articles/:id/', checkAuthenticated, 
  async (req, res) => {
    let article
    try {
      article = await Article.findById(req.params.id)
      article.title = req.body.title
      article.category = req.body.category
      article.author = req.body.author
      article.content = req.body.content
      article.publishDate = new Date(req.body.publishDate)
      if (req.body.cover != null && req.body.cover !== '') {
        saveCover(article, req.body.cover)
      }
      await article.save()
      res.redirect(`/articles/${article.id}`)

    } catch {

      if (article != null) {
        renderEditPage(res, article, true)
      } else {
        redirect('/')
      }

    }
  });


//Route Delete article
router.delete('/articles/:id', checkAuthenticated, async (req, res) => {
  let article
  try {
    article = await Article.findById(req.params.id)
    await article.remove()
    res.redirect('/articles')
  } catch {
    if (article != null) {
      res.render('show', {
        article: article,
        errorMessage: 'Could not remove article'
      })
    } else {
      res.redirect('/')
    }

  }
})


function saveCover(article, coverEncoded) {
  if(coverEncoded == null || coverEncoded.length < 1) return
  const cover = JSON.parse(coverEncoded)

  if (cover != null && imageMimeTypes.includes(cover.type)) {
    article.coverImage = new Buffer.from(cover.data, 'base64')
    article.coverImageType = cover.type
  }
}




async function renderNewPage(res, article, hasError = false) {
  renderFormPage(res, article, 'new', hasError)
}

async function renderEditPage(res, article, hasError = false) {
  renderFormPage(res, article, 'edit', hasError)
}


async function renderFormPage(res, article, form, hasError = false) {
  try {
    const category = await Category.find({})
    const params = {
      category: category,
      article: article
    }
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = "Error Updating article"
      } else {
        params.errorMessage = "Error Creating article"
      }
    }
    res.render(`${form}`, params)
    
  } catch {
    res.redirect('/articles')
  }
}





function checkAuthenticated(req,res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next ()
}






module.exports = router