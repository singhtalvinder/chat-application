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
const sidebarTemplate = document.querySelector('#sidebar_template').innerHTML

// Options.
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true}) // remove the ? from the query string

// Message autoscrolling window.
const autoscroll = () => {
    // Get new message element.
    const $newMessage = $messages.lastElementChild

    // Get height of new message and margins from its styles to get the exact data.
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)

    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height of the this chat window.
    const visibleHeight = $messages.offsetHeight

    // Height of the messages(chat) container.
    const containerHeight = $messages.scrollHeight

    // Check how far is scrolled.
    //  $messages.scrollTop give the distance from top(generally where the scrollbar is).
    // Visible height : Scrollbar height.
    const scrollOffset = $messages.scrollTop + visibleHeight

    // Scroll bottom when total containerHeight  less the (last) newMessage height
    // is less than or equal the scroll offset.
    if(containerHeight - newMessageHeight <= scrollOffset) {
        // Scroll down all the way.
        $messages.scrollTop = $messages.scrollHeight
    }

}


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
        username: messageData.username,
        message: messageData.text,
        createdAt: moment(messageData.createdAt).format('HH:mm:ss')
    })

    $messages.insertAdjacentHTML('beforeend', myHtml)
    autoscroll()
})

 // Receive location related message from the server.
 socket.on('locationMessage', (locationMsg) => {
     console.log(`locationMessage: ${locationMsg.url}`)  
          
    // render the new message to the browser.
    const myHtml = Mustache.render(locationMessageTemplate, {
        url: locationMsg.url,
        username: locationMsg.username,
        url: locationMsg.url,
        createdAt: moment(locationMsg.createdAt).format('HH:mm:ss')
    })

    $messages.insertAdjacentHTML('beforeend', myHtml)
    autoscroll()
 })

 // Listen to roomData message.
 socket.on('roomData', ({ room, users }) => {
    const roomHtml = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = roomHtml
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

// Emit join.Add a corresponding listener to the server to handle the request.
socket.emit('join', {username, room}, (error) => {
    // ack func to process errors or success.

    if(error) {
        alert(error)
        // redirect to home page.
        location.href= '/'
    }
})
