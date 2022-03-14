const { Client } = require('pg')
const express = require('express')
const cors = require('cors')
const app = express();

app.use(cors({
    origin: 'http://localhost:3000'
}))
app.use(express.json())


 function connectToDB(){
    const client = new Client({
        user: "postgres",
        password: "richard",
        host: "localhost",
        port: 5432,
        database: "gis_two"
    })
    return client
 }

 async function createFeature(insert_values, geom) {
    const client = connectToDB()
    try {
        geometry = JSON.stringify(geom)
        console.log(geometry)
        console.log(insert_values)
        await client.connect()
        console.log('connected')
        await client.query('BEGIN')
        await client.query("INSERT INTO test(col_1, geom) VALUES ($1, ST_SetSRID(ST_GeomFromGeoJSON($2), 27700))", [insert_values, `${geometry}`])
        await client.query('COMMIT')
        
        
    }
    catch (err) {
        console.log(err)
    }
    finally {
        await client.end()
        console.log('connection closed')
    }  
}

async function execute() {
    const client = connectToDB()
    try {
        await client.connect()
        console.log('connected')
        const the_query = await client.query("SELECT * FROM test")
        console.table(the_query.rows)
        return(the_query.rows)
    
    }
    catch (err) {
        console.log(err)
    }
    finally {
        await client.end()
        console.log('connection closed')
    } 
}


app.get('/database',  async (req, res) => {
    const q =  await execute()
    res.setHeader('content-type', 'application/json')
    
    console.log(JSON.stringify(q))
    
    
    res.send(JSON.stringify(q))
})


app.post('/database',  async (req, res) => {
    result = {}
    try {
        
        const reqJson = req.body;
        console.log(reqJson)
        await createFeature(reqJson.col_1, reqJson.geometry)
        result.success=true;  
    }
    catch(e) {
        result.success=false;

    }
    finally {
        res.setHeader('content-type', 'application/json')
        res.send(JSON.stringify(result))

    }
})

app.listen(8111, () => console.log('server running!'))




