import mongoose from 'mongoose'

import Book from '../models/book.js'
import Request from '../models/request.js'
import User from '../models/user.js'
import Verse from '../models/verse.js'
import books from './mock/books.json'
import verses from './mock/verses.json'

export const connect = async () => {
  return mongoose.connect('mongodb://localhost/abibliadigital', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  })
}

const createBooks = async () => {
  const promises = books.map(async book => new Book(book).save())
  return Promise.all(promises)
}

const createVerses = async (books) => {
  const bookByKey = {}
  await books.map(book => {
    bookByKey[book.abbrev.en] = book
  })

  const promises = verses.map(async verse => {
    verse.book = {
      id: bookByKey[verse.book.abbrev.en]._id,
      abbrev: bookByKey[verse.book.abbrev.en].abbrev
    }
    return new Verse(verse).save()
  })
  return Promise.all(promises)
}

const createUser = async () => {
  return new User({
    token: '1234567890',
    name: 'Fake User',
    email: 'root@abibliadigital.com.br',
    password: '123456',
    notifications: false
  }).save()
}

export const initDatabase = async () => {
  const connection = await connect()
  await User.deleteMany()
  await Book.deleteMany()
  await Verse.deleteMany()
  await Request.deleteMany()
  const books = await createBooks()
  await createVerses(books)
  await createUser()
  connection.disconnect()
}

initDatabase()
