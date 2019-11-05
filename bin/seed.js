const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })
const mongoose = require('mongoose')
require('../configs/database')
const App = require('../models/App')
const errors = []

async function submitDocuments(name, model, jsonData, drop = true) {
  var documents
  try {
    drop && await model.deleteMany()
    documents = await model.create(jsonData)
  } catch (err) {
    errors.push(`${name} - Could not finish populating documents: ${err.name} - ${err.errmsg}`)
  } finally {
    const count = await model.countDocuments()
    console.log(`${count} ${name} created.`)
  }
}

async function createDBEntries() {
  await submitDocuments('apps', App, Array.from({ length: 999 }).map((e, i) => {
    const id = i + 1;

    return {
      id,
      name: `my-app-${`${id}`.padStart(3, '0')}`,
    }
  }))
}

createDBEntries();