// Client side code for the chat application.
// Let the client connect to the server to communicate.
const socket = io()

////////////////////////////////////////////////////////////////////////////
// Acknowledgement pattern:
// server(emit) ---> client(receive) ---> acknowledgement-to----> server.
// client(emit) ---> server(receive) ---> acknowledgement-to----> client.
///////////////////////////////////////////////////////////////////////////
// Receive the communication from the server.
socket.on('message', (messageData) => console.log(messageData))

document.querySelector('#messageForm').addEventListener('submit', (e) => {
    e.preventDefault() //prevent default form refresh.

    // enit the event -message.
    const clientMessage = e.target.elements.msg.value

    // client sends message to server.
    socket.emit('sendMessage', clientMessage, (profaneMsg) => {
        // Run it when an event is acknowledged. Must have corresponding listener in server.

        if(profaneMsg) {
            return console.log(`This message is marked as inappropriate: ${profaneMsg}`)
        }

        console.log('The message was delivered.')
    })

})

// Process send location event.
document.querySelector('#sendMyLocation').addEventListener('click', () => {
    // Check if geolocation is supported.
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by the browser.')
    }

    navigator.geolocation.getCurrentPosition((position) =>{
        console.log(position)
        socket.emit('sendLocation', 
        {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },
        () =>{
            // Acknowledgement message.
            console.log('Location is shared.')
        })
    })
})
