// Common functions.
// Generate message.
const generateMessage = (username, text) =>{
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }

}

// Generate location message.
const generateLocationMessage = (username, msgUrl) =>{
    return {
        username,
        url: msgUrl,
        createdAt: new Date().getTime()
    }

}

module.exports = {
    generateMessage,
    generateLocationMessage
}