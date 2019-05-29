require('dotenv').config()

const express = require('express')
const request = require('request')
const path = require('path')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongo = require('mongodb')
const files = require('./files')

const PORT = process.env.PORT || 3001
const MongoUrl =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/stupidserver'
const SlackWebhook = process.env.SLACK_HOOK
const KEY = process.env.KEY || '38-ED5Rr(ahgRcwyabcdefgh'

let db
const app = express()
const MongoClient = mongo.MongoClient

app.use(bodyParser.json())
app.use(express.urlencoded())
app.use(cors())
app.options('*', cors())

app.post('/api', (req, res) => {
  req.body.show = false
  db.collection('data').insertOne(req.body, function(err, resp) {
    if (err) throw err
    console.log('data inserted')
    slack(req.body, req.body.collection)
    res.sendStatus(200)
  })
})

app.get('/api', (req, res) => {
  if (req.query.key !== KEY) return res.sendStatus(403)

  delete req.query.key
  req.query.show = true
  findDocuments(db, 'data', req.query, data => res.send(data))
})

app.post('/slack/approve', (req, res) => {
  console.log(JSON.parse(req.body.payload).actions[0])
  // db.collection('data').updateOne(
  //   { _id: new mongo.ObjectId(req.query.id) },
  //   { $set: { schow: true } },
  //   (err, result) => {
  //     if (err) throw err
  //     res.sendStatus(200)
  //   }
  // )
})

MongoClient.connect(
  MongoUrl,
  { useNewUrlParser: true },
  (err, client) => {
    if (err) throw err
    db = client.db()

    app.use('/files', files(db))

    app.listen(PORT, () => console.log(`Listening on port ${PORT}!`))
  }
)

// Utility Functions

const findDocuments = (db, col, query, callback) => {
  // Get the documents collection
  const collection = db.collection(col)
  // Find some documents

  // Fixme: Works currently only with strings.
  collection.find(query).toArray(function(err, docs) {
    callback(docs)
  })
}

const slack = (msg, title) => {
  const message = {
    blocks: [
      { type: 'divider' },
      {
        type: 'section',
        fields: [{ type: 'mrkdwn', text: `New Submit for *${title}*` }]
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Approve'
            },
            style: 'primary',
            value: msg._id,
            action_id: 'approve'
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Update Website'
            },
            url: 'https://google.com'
          }
        ]
      }
    ],
    attachments: [
      {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '```' + JSON.stringify(msg, null, 2) + '```'
            }
          }
        ]
      }
    ]
  }

  const options = { uri: SlackWebhook, method: 'POST', json: message }

  request(options, (err, res, body) => {
    if (err || res.statusCode != 200) {
      console.log('Body: ' + body, 'StatusCode: ' + res.statusCode, err)
    }
  })
}
