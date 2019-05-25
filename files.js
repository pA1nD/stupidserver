const express = require('express')
const multer = require('multer')
const multerS3 = require('multer-s3')
const aws = require('aws-sdk')

module.exports = db => {
  app = express()

  aws.config.update({
    secretAccessKey: process.env.SECRET_ACCESS_KEY || '',
    accessKeyId: process.env.ACCESS_KEY_ID || '',
    region: 'eu-central-1'
  })

  const s3 = new aws.S3()

  const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'stupid-file-server',
      acl: 'public-read',
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname })
      },
      key: (req, file, cb) => {
        cb(null, Date.now().toString())
      }
    })
  })

  const singleUpload = upload.single('image')

  app.post('/upload', (req, res) => {
    singleUpload(req, res, (err, some) => {
      console.log('done')
      if (err) {
        return res.status(422).send({
          errors: [{ title: 'Image Upload Error', detail: err.message }]
        })
      }

      db.collection('files').insertOne(
        { imageUrl: req.file.location },
        (err, res) => {
          if (err) throw err
          console.log('file inserted')
        }
      )

      return res.json({ imageUrl: req.file.location })
    })
  })

  return app
}
