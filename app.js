const express = require('express')
const path = require('path')
const sqlite3 = require('sqlite3')
const sqlite = require('sqlite')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())
const port = 3000

async function openDb () {
  return sqlite.open({
    filename: './database.db',
    driver: sqlite3.Database
  })
}

openDb()
    .then(db => {
        db.exec("CREATE TABLE IF NOT EXISTS data (key TEXT PRIMARY KEY, value TEXT NOT NULL);")
    })
    .catch(err => {
        console.error(err);
    })

app.get('/new', (req, res) => {
    console.log("/GET /new")
    res.sendFile(path.join(__dirname, "index.html"))
})

app.get('/find', (req, res) => {
    console.log("/GET /find")
    res.sendFile(path.join(__dirname, "find.html"))
})

app.post('/make', async (req, res) => {
    try {
        const db = await openDb()
        let key = req.body.key
        let value = req.body.value
        console.log('/POST /make')
        console.log(`key <- ${key}`)
        console.log(`value <- ${value}`)
        await db.run("INSERT INTO data(key,value) VALUES(?, ?);", key, value)
        res.json({ message: "success" })
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred.");
    }
})

app.get('/data', async (req, res) => {
    try {
        const key = req.query.key;
        console.log('/GET /data')
        console.log(`key <- ${key}`);
        const db = await openDb()
        let data = await db.get("SELECT value FROM data WHERE key = ?", key);
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred.");
    }
})

app.get('/all_data', async (req, res) => {
    console.log("/GET /data")
    try {
        const db = await openDb();
        let data = await db.all("SELECT key, value FROM data;")
        res.json(data)
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred.");
    }
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})
