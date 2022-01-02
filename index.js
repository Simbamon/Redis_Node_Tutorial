const express = require('express')
const fetch = require('node-fetch')
const redis = require('redis')

const asdf = process.env.PORT || 5000
const REDIS_PORT = process.env.PORT || 6379

const client = redis.createClient(REDIS_PORT)

const app = express()

app.listen(asdf, () => {
    console.log(`Example app listening at http://localhost:${asdf}`)
})