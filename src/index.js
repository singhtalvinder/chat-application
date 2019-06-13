const path = require('path')
const express = require('express')

const app = express()

const port = process.env.port || 3000

const publicDirPath = path.join(__dirname,'../public')

app.use(express.static(publicDirPath))

app.listen(port, () =>{
    console.log(`Server is up and running at port: ${port}.`)
})


