const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

//const url =  `mongodb+srv://asheshsae:${password}@cluster0.x13vbhl.mongodb.net/?retryWrites=true&w=majority`

const url =
`mongodb://asheshsae:${password}@ac-6a9n48q-shard-00-00.x13vbhl.mongodb.net:27017,ac-6a9n48q-shard-00-01.x13vbhl.mongodb.net:27017,ac-6a9n48q-shard-00-02.x13vbhl.mongodb.net:27017/noteApp?ssl=true&replicaSet=atlas-eyirar-shard-0&authSource=admin&retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

const note = new Note({
  content: 'CSS is hard',
  date: new Date(),
  important: true,
})

note.save().then(() => {
  console.log('note saved!')
  mongoose.connection.close()
})
/*

Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})*/