const path = require('path')
const http = require('http')
const express = require('express')

// Use the server side of socket io to use here as a server.
// And implement the client side using the client side code of the socket io.
const socketio = require('socket.io')

// For filtering out inappropriate words.
const badWordsFilter = require('bad-words')

const {generateMessage, generateLocationMessage} = require('./utils/messages')

const app = express()

const server = http.createServer(app)

const io = socketio(server)

const port = process.env.port || 3000

const publicDirPath = path.join(__dirname,'../public')

app.use(express.static(publicDirPath))

// On each connected client.
io.on('connection', (socket) =>{
    console.log('New websocket connection established.')

    // // Send an event from the server to the client.
    // // It's to a specific client connection. Not to everyone.
    // socket.emit('message', generateMessage('Welcome!'))

    // // Broadcast nessage to everyone except the owner(initiating client)
    // socket.broadcast.emit('message', generateMessage('A new user has joined.'))

    // Listener for join room.
    socket.on('join', ({ username, room}) => {
        // can only be used on server.
        socket.join(room)

        /////////////////////////////////////////////////////////////
        // send only to the joined room.
        //io.to.emit
        // Send to everyone except the specific client.
        //socket.broadcast.to.emit
        ///////////////////////////////////////////////////////////////

        // Send an event from the server to the client.
        // It's to a specific client connection. Not to everyone.
        socket.emit('message', generateMessage('Welcome!'))

        // Broadcast nessage to everyone in the room(joined) except the owner(initiating client)
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined: ${room}.`))

    })

    // Listener for the messages.
    socket.on('sendMessage', (messageRcvd, callback) => {

        // Check for inappropriate words.
        const filter = new badWordsFilter()
        if(filter.isProfane(messageRcvd)) {
            return callback('Profanity not allowed!!')
        }

        // Send to every connected client.
        io.to('kids').emit('message', generateMessage(messageRcvd))

        // Callback(acknowledge the event) is executed on 
        callback()
    })

    // Send location of one client to every other client.
    socket.on('sendLocation', (locationCoords, locAckn) =>{
        io.emit('locationMessage', 
          generateLocationMessage(`https://google.com/maps?q=${locationCoords.latitude},${locationCoords.longitude}`))
        locAckn()
    })

    // Whenever a client disconnects must be handled inside the io.on  like below.
    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left.'))
    })
})

server.listen(port, () =>{
    console.log(`Server is up and running at port: ${port}.`)
})
