const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

//The following URI comes from the environment Variable from .env file
const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

//Validation functionality available in Mongoose
//We can define specific validation rules for each field in the schema
//The minLength and required validators are built-in and provided by Mongoose. 
//The Mongoose custom validator functionality allows us to create new validators if none of the built-in ones cover our needs.
const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    minLength: 5,
    required: true
  },
  important: Boolean,
})

//Remove the extra _id from the response
noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Note', noteSchema)
//public interface of the module is defined by setting a value to the module.exports variable
//That means Note will be accessible

//however the variables mongoose and url will not be accessible or visible to users of the module