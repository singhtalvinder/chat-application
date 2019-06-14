// common functions.
const generateMessage = (text) =>{
    return {
        text,
        createdAt: new Date().getTime()
    }

}

const generateLocationMessage = (msgUrl) =>{
    return {
        url: msgUrl,
        createdAt: new Date().getTime()
    }

}

module.exports = {
    generateMessage,
    generateLocationMessage
}