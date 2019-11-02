const mongoose = require('mongoose')
const Schema = mongoose.Schema

const appSchema = new Schema({
  id: Number,
  name: String,
})

const App = mongoose.model('App', appSchema)

module.exports = App