// Client side code for the chat application.
// Let the client connect to the server to communicate.
const socket = io()

// Elements of the form.
const $messageForm = document.querySelector('#messageForm')
const $messageFormInput = $messageForm.querySelector('input') 
const $messageFormButton = $messageForm.querySelector('button') 
const $sendLocationButton = document.querySelector('#sendMyLocation')
const $messages = document.querySelector('#messages')

// templates for rendering.
const messageTemplate = document.querySelector('#message_template').innerHTML
const locationMessageTemplate = document.querySelector('#locationmessage_template').innerHTML


////////////////////////////////////////////////////////////////////////////
// Acknowledgement pattern:
// server(emit) ---> client(receive) ---> acknowledgement-to----> server.
// client(emit) ---> server(receive) ---> acknowledgement-to----> client.
///////////////////////////////////////////////////////////////////////////

// Receive the communication from the server.
socket.on('message', (messageData) => {
    console.log(messageData)

    // render the new message to the browser.
    const myHtml = Mustache.render(messageTemplate, {
        message: messageData
    })

    $messages.insertAdjacentHTML('beforeend', myHtml)
})

 // Receive location related message from the server.
 socket.on('locationMessage', (locationUrl) => {
     console.log(`locationMessage: ${locationUrl}`)  
          
    // render the new message to the browser.
    const myHtml = Mustache.render(locationMessageTemplate, {
        locationUrl
    })
     $messages.insertAdjacentHTML('beforeend', myHtml)
 })

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault() //prevent default form refresh.

    // Disable the button.
    $messageFormButton.setAttribute('disabled', 'disabled')
    // Emit the event -message.
    const clientMessage = e.target.elements.msg.value

    // client sends message to server.
    socket.emit('sendMessage', clientMessage, (profaneMsg) => {
        // Run it when an event is acknowledged. Must have corresponding listener in server.

        // Enable button, clear off values abd set focus.
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(profaneMsg) {
            return console.log(`This message is marked as inappropriate: ${profaneMsg}`)
        }

        console.log('The message was delivered.')
    })

})

// Process send location event.
$sendLocationButton.addEventListener('click', () => {
    // Check if geolocation is supported.
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by the browser.')
    }

    // Disable the button.
    $sendLocationButton.setAttribute('disabled', 'disabled')

    // Get location coordinates.
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
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})
