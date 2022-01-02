const express = require('express')
const fetch = require('node-fetch')
const redis = require('redis')
const bodyParser = require('body-parser')

const PORT = process.env.PORT || 5000
const REDIS_PORT = process.env.PORT || 6379

const RedisClient = redis.createClient(REDIS_PORT)

const app = express()


function setResponse(username, repos) {
    return `<h2>${username} has ${repos} Github Repos</h2>`
}

async function getReposNumber(req, res, next) {
    try {
        console.log("Fetching Data...")
        
        const { username } = req.params;
        const response = await fetch(`https://api.github.com/users/${username}`)
        const data = await response.json()
        const repos = data.public_repos

        RedisClient.setex(username, 3600, repos)

        res.send(setResponse(username, repos))

    } catch (error) {
        console.error(error)
        res.status(500)
    }
}

function cache(req, res, next) {
    
    const { username } = req.params
    
    RedisClient.get(username, (err, data) => {
        if(err) throw err;

        if(data !== null){
            console.log("Cache hit")
            res.send(setResponse(username, data))
        } 
        else {
            next()
        }
    })
}
app.get('/repos/:username', cache, getReposNumber)

app.get('/photos', async(req, res) => {
    const albumID = req.query.albumID
    RedisClient.get("photos", async(error, photos) => {
        if(error) throw error
        if(photos !== null) {
            console.log("Cache hit")
            return res.json(JSON.parse(photos))
        }
        else {
            console.log("Cache miss")
            const response = await fetch("https://jsonplaceholder.typicode.com/photos")
            const data = await response.json()
            RedisClient.setex("photos", 3600, JSON.stringify({data}))
            res.json(data)
        }
        
    })
})

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
})