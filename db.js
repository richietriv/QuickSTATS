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
        const now = new Date()
        geometry = JSON.stringify(geom)
        console.log(geometry)
        console.log(insert_values)
        await client.connect()
        console.log('connected')
        await client.query('BEGIN')
        console.log(geom.type)

        if (geom.type == 'Point') {
            
            await client.query("INSERT INTO point_search(email, reference, enquiry_type, searchtype, contract, geom, datetime_requested) VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_GeomFromGeoJSON($6), 27700), $7)", [insert_values.email, insert_values.reference, insert_values.enquiryType, insert_values.searchSize, insert_values.contract, geometry, now])
        } else {
            await client.query("INSERT INTO linear_search(email, reference, enquiry_type, contract, geom) VALUES ($1, $2, $3, $4, ST_SetSRID(ST_GeomFromGeoJSON($5), 27700))", [insert_values.email, insert_values.reference, insert_values.enquiryType, insert_values.contract, geometry])

        };
        

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
        const the_query = await client.query("SELECT * FROM point_search")
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
        console.log(reqJson.geometry)
        await createFeature(reqJson, reqJson.geometry)
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




