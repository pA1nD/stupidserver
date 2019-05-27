const express = require('express')
const path = require('path')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongo = require('mongodb')
const files = require('./files')

let db
const app = express()
const PORT = process.env.PORT || 3001
const MongoClient = mongo.MongoClient
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/stupidserver'

app.use(bodyParser.json())
app.use(express.urlencoded())
app.use(cors())
app.options('*', cors())

app.post('/api', (req, res) => {
  req.body.show = false
  db.collection('data').insertOne(req.body, function(err, res) {
    if (err) throw err
    console.log('data inserted')
  })
  res.sendStatus(200)
})

app.get('/api', (req, res) => {
  req.query.show = true
  findDocuments(db, 'data', req.query, data => res.send(data))
})

MongoClient.connect(
  url,
  { useNewUrlParser: true },
  function(err, client) {
    if (err) throw err
    db = client.db()
    db.createCollection('data', function(err, res) {
      if (err) throw err
      app.use('/files', files(db))
      console.log('Collection "data" created!')
      app.listen(PORT, () => console.log(`Listening on port ${PORT}!`))
      //client.close()
    })
  }
)

// Utility Functions

const findDocuments = function(db, col, query, callback) {
  // Get the documents collection
  const collection = db.collection(col)
  // Find some documents

  // Fixme: Works currently only with strings.
  collection.find(query).toArray(function(err, docs) {
    callback(docs)
  })
}
