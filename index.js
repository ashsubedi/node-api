const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config() //to get the envionment variables from .env file


//Database configuration into its own Node module
//For Connection to MongoDb using Mongoose
//Below Line: Importing the module
const Note = require('./models/note') 

// Middleware - Log the API Calls
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
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
    if(note){
      response.json(note)
    }else{
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.post('/api/notes', (request, response) => {
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

  note.save().then(savedNote => {
    response.json(savedNote)
  })
})

app.put('/api/notes/:id', (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  //Mongoose's findByIdAndUpdate method
  //the optional { new: true } parameter, which cause our event handler 
  //to be called with the new modified document instead of the original
  Note.findByIdAndUpdate(request.params.id, note, { new: true })
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
  } 

  next(error)
}

// handler of requests with result to errors
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})