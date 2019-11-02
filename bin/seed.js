const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })
const mongoose = require('mongoose')
require('../configs/database')
const App = require('../models/App')
const errors = []

async function submitDocuments(name, model, jsonData, drop = true) {
  var documents
  try {
    console.log('dropping .')
    console.log(model)
    drop && await model.deleteMany()
    console.log('creating .')
    console.log(model)
    documents = await model.create(jsonData)
  } catch (err) {
    errors.push(`${name} - Could not finish populating documents: ${err.name} - ${err.errmsg}`)
  } finally {
    const count = await model.countDocuments()
    console.log(`${count} ${name} created.`)
  }
}

async function createDBEntries() {
  console.log('starting to create DB Entries.')

  await submitDocuments('apps', App, Array.from({ length: 999 }).map((e, i) => {
    const id = i + 1;

    return {
      id,
      name: `my-app-${`${id}`.padStart(3, '0')}`,
    }
  }))
}

function seed(cb) {
  cb()
    .then(() => {
      console.log('\n\nRan into these errors:')
      console.log('\n\t' + errors.join('\n\t') + '\n\n')
      mongoose.disconnect()
    })
    .catch(err => {
      console.log('Error populating the database:  ', err)
      mongoose.disconnect()
    })
}

seed(createDBEntries)