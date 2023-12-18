const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

notesRouter.get('/', async (request, response) => {
    const notes = await Note.find({})
    response.json(notes)
})

//Mongoose's findById method
notesRouter.get('/:id', async (request, response) => {
    const note = await Note.findById(request.params.id)
    if (note) {
        response.json(note)
    } else {
        response.status(404).end()
    }
})

// If there is an error during the execution of the Note.findById promise,
// the catch block is triggered. Inside the catch block, next(error) is called, 
// passing the error to the next middleware in the chain.

// next is a callback function that is used to pass control to the next middleware in the stack.
// In Express.js, middleware functions have access to the next function, 
// and calling it within a middleware function allows the application to move on to the next middleware in the chain

notesRouter.post('/', async (request, response) => {
    const body = request.body

    const user = await User.findById(body.userId)

    const note = new Note({
        content: body.content,
        important: body.important === undefined ? false : body.important,
        user: user.id
    })

    const savedNote = await note.save()
    user.notes = user.notes.concat(savedNote._id)
    await user.save()
    response.status(201).json(savedNote)
})

notesRouter.delete('/:id', async (request, response) => {
    //Mongoose's findByIdAndDelete method
    await Note.findByIdAndDelete(request.params.id)
    response.status(204).end()
})
//Removed next from the params and the try-catch block because express-async-errors library handles it
//If an exception occurs in an async route, the execution is automatically passed to the error handling middleware

notesRouter.put('/:id', (request, response, next) => {
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

module.exports = notesRouter