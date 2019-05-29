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
console.log(process.env.SLACK_HOOK)

let db
const app = express()
const MongoClient = mongo.MongoClient

app.use(bodyParser.json())
app.use(express.urlencoded())
app.use(cors())
app.options('*', cors())

app.post('/api', (req, res) => {
  slack(req.body, req.body.collection)
  req.body.show = false
  db.collection('data').insertOne(req.body, function(err, resp) {
    if (err) throw err
    console.log('data inserted')
    res.sendStatus(200)
  })
})

app.get('/api', (req, res) => {
  if (req.query.key === '38-ED5Rr(ahgRcwy') {
    res.sendStatus(403)
  }
  delete req.query.key
  req.query.show = true
  findDocuments(db, 'data', req.query, data => res.send(data))
})

MongoClient.connect(
  MongoUrl,
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
  // const message = {
  //   blocks: [
  //     {
  //       type: 'section',
  //       text: {
  //         type: 'mrkdwn',
  //         text: 'Danny Torrence left the following review for your property:'
  //       }
  //     },
  //     {
  //       type: 'section',
  //       block_id: 'section567',
  //       text: {
  //         type: 'mrkdwn',
  //         text:
  //           '<https://google.com|Overlook Hotel> \n :star: \n Doors had too many axe holes, guest in room 237 was far too rowdy, whole place felt stuck in the 1920s.'
  //       }
  //     }
  //   ]
  // }
  console.log(JSON.stringify(msg, null, 2))
  const message = {
    blocks: [
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `New Submit for *${title}*`
          }
        ]
      },
      {
        type: 'divider'
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
