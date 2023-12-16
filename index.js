const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config() //to get the envionment variables from .env file


//Database configuration into its own Node module
//For Connection to MongoDb using Mongoose
//Below Line: Importing the module
const Note = require('./models/note')

// Middleware - logs information about incoming HTTP requests before passing control to the next middleware in the stack
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')

  // Call the next middleware in the stack
  next()
}

//Middleware - Return 404 status if invalid endpoint is called
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(cors())
app.use(express.json())
app.use(requestLogger) //Use API logger middleware
app.use(express.static('dist')) //Use FED assets from dist

let notes = []

app.get('/', (req, res) => {
  res.send('<h1>REST APIs</h1>')
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

//Mongoose's findById method
app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

// If there is an error during the execution of the Note.findById promise,
// the catch block is triggered. Inside the catch block, next(error) is called, 
// passing the error to the next middleware in the chain.

// next is a callback function that is used to pass control to the next middleware in the stack.
// In Express.js, middleware functions have access to the next function, 
// and calling it within a middleware function allows the application to move on to the next middleware in the chain

app.post('/api/notes', (request, response, next) => {
  const body = request.body

  if (body.content === undefined) {
    return response.status(400).json({
      error: 'content missing'
    })
  }
  const note = new Note({
    content: body.content,
    important: body.important || false,
    // id: generateId(),
  })

  note.save()
    .then(savedNote => {
      response.json(savedNote)
    })
    .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
  const { content, important } = request.body

  //Mongoose's findByIdAndUpdate method
  //the optional { new: true } parameter, which cause our event handler 
  //to be called with the new modified document instead of the original
  Note.findByIdAndUpdate(
    request.params.id,
    { content, important },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
  //Mongoose's findByIdAndDelete method
  Note.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

//Code to generateId not needed
/*
const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0
  return maxId + 1
}
*/

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

//Middleware for handling error
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  // If the error is not explicitly handled above, pass it to the next middleware
  next(error)
}

// handler of requests with result to errors
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})