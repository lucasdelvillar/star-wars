const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const MongoClient = require('mongodb').MongoClient

MongoClient.connect(process.env.mongodb, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database')
    const db = client.db('star-wars-quotes')
    const quotesCollection = db.collection('quotes')

    app.set('view engine', 'ejs')

    //middle ware
    app.use(express.static('public'))
    app.use(bodyParser.json())

    // Make sure to put before CRUD handlers!
    app.use(bodyParser.urlencoded({ extended: true }))

    // READ quotes
    app.get('/', (req, res) => {
      db.collection('quotes').find().toArray()
        .then(results => {
          console.log(results)
          res.render('index.ejs', { quotes: results })
        })
        .catch(error => console.error(error))
    })

    // CREATE quotes
    app.post('/quotes', (req, res) => {
      quotesCollection.insertOne(req.body)
        .then(result => {
          res.redirect('/')
        })
        .catch(error => console.error(error))
    })

    // UPDATE yoda quote
    app.put('/quotes', (req, res) => {
      quotesCollection.findOneAndUpdate(
        { name: 'Yoda' },
        {
          $set: {
            name: req.body.name,
            quote: req.body.quote
          }
        },
        {
          upsert: false
        }
      )
      .then(result => {
        console.log('Success')
       })
      .catch(error => console.error(error))
    })

    // DELETE a quote. This will delete a darth vader quote specifically
    app.delete('/quotes', (req, res) => {
      quotesCollection.deleteOne(
        { name: req.body.name }
      )
        .then(result => {
          res.json(`Deleted Darth Vadar's quote`)
        })
        .catch(error => console.error(error))
    })

    app.listen(process.env.PORT || 3000, function() {
      console.log('listening on 3000')
    })
  })
  .catch(error => console.error(error))
