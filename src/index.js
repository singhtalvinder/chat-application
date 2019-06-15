const path = require('path')
const http = require('http')
const express = require('express')

// Use the server side of socket io to use here as a server.
// And implement the client side using the client side code of the socket io.
const socketio = require('socket.io')

// For filtering out inappropriate words.
const badWordsFilter = require('bad-words')

const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { getUser, addUser, removeUser, getUsersInRoom } = require('./utils/users')

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
    socket.on('join', (options, joinCallback) => {
        // Add the user.
        const {error, user } = addUser( {id: socket.id, ...options}) // get username, room from options.
        if(error) {
            return joinCallback(error)
        }
        // Proceed if user is added.

        // can only be used on server.
        socket.join(user.room)

        /////////////////////////////////////////////////////////////
        // send only to the joined room.
        //io.to.emit
        // Send to everyone except the specific client.
        //socket.broadcast.to.emit
        ///////////////////////////////////////////////////////////////

        // Send an event from the server to the client.
        // It's to a specific client connection. Not to everyone.
        socket.emit('message', generateMessage('Admin', 'Welcome!'))

        // Broadcast nessage to everyone in the room(joined) except the owner(initiating client)
        socket.broadcast
            .to(user.room)
            .emit('message', generateMessage('Admin', `${user.username} has joined.`))

        // Send message(active users) to everyone including this user.
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        // let the client know it was able to join successfully.
        joinCallback()

    })

    // Listener for the messages.
    socket.on('sendMessage', (messageRcvd, callback) => {
        // Get this user.
        const user = getUser(socket.id)

        // Check for inappropriate words.
        const filter = new badWordsFilter()
        if(filter.isProfane(messageRcvd)) {
            return callback('Profanity not allowed!!')
        }

        // Send to every connected client in the same room.
        io.to(user.room).emit('message', generateMessage( user.username, messageRcvd))

        // Callback(acknowledge the event) is executed on 
        callback()
    })

    // Send location of one client to every other client.
    socket.on('sendLocation', (locationCoords, locAckn) =>{
        // Get this user.
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', 
          generateLocationMessage(user.username,`https://google.com/maps?q=${locationCoords.latitude},${locationCoords.longitude}`))
        locAckn()
    })

    // Whenever a client disconnects must be handled inside the io.on  like below.
    socket.on('disconnect', () => {
        // removeUser.
        const user = removeUser(socket.id)

        // Send message only if a user is removed.
        if(user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left the room.`))
            
            // Send message(active users) to everyone including this user.
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
        })
        }
    })
})

server.listen(port, () =>{
    console.log(`Server is up and running at port: ${port}.`)
})
