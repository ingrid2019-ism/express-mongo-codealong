import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/books'
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

//The database models
const Author = mongoose.model('Author', {
  name: String
})

const Book = mongoose.model('Book', {
  title: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author'
  }
})

if (process.env.RESET_DATABASE) {
  console.log('Resetting my database!')

  const seedDatabase = async () => {
    await Author.deleteMany()
    await Book.deleteMany()

    const tolkien = new Author({ name: 'J.R.R Tolkien' })
    await tolkien.save()

    const rowling = new Author({ name: 'J.K. Rowling' })
    await rowling.save()

    await new Book({ title: 'Harry Potter and the philosopher´s stone', author: rowling }).save()
    await new Book({ title: 'Harry Potter and the chamber of secrets', author: rowling }).save()
  }
  seedDatabase()
}



// Defines the port the app will run on. Defaults to 8080, but can be 
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8081
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())

// Start defining your routes here
app.get('/', (req, res) => {
  res.send('Hello world')
})

//Endpoint Fetching all the authors
app.get('/authors', async (req, res) => {
  const authors = await Author.find()
  res.json(authors)
})

//Endpoint Fetching a single author
app.get('/authors/:id', async (req, res) => {
  const author = await Author.findById(req.params.id)
  if (author) {
    res.json(author)
  } else {
    res.status(404).json({ error: 'Author not found' })
  }
})

//Endpoint Fetching all books from a specific author
app.get('/authors/:id/books', async (req, res) => {
  const author = await Author.findById(req.params.id)
  if (author) {
    const books = await Book.find({ author: mongoose.Types.ObjectId(author.id) })
    res.json(books)
  } else {
    res.status(404).json({ error: 'Author not found' })
  }
})

//Endpoint Fetching all the books
app.get('/books', async (req, res) => {
  const books = await Book.find().populate('author')
  res.json(books)
})



// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
