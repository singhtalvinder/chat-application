/// Keep track of joined users.
const users = []

// Add user
const addUser = ({ id,username, room }) => {
    // clean the data and validate.
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate.
    if(!username || !room) {
        return {
            error: 'Username and room are required.'
        }
    }

    // Check existing user.
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate user name.
    if(existingUser) {
        return {
            error: 'Username is already taken. Join with some other name.'
        }
    }

    // Store the user.
    const user = {id, username, room}
    
    users.push(user)

    return { user }
}

// remove a user.
const removeUser = (id) => {
    const index = users.findIndex( (user ) => user.id === id )

    if(index !== -1) {
        // returned the removed user.
        return users.splice(index, 1)[0]
    }
}

// get a user.
const getUser = (id) => {
    return users.find((user) => user.id === id)
}

// get users in a room.
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
    

}
// Test data.
// addUser({
//     id:20,
//     username: 'TS',
//     room: 'Devs'
// })

// addUser({
//     id:40,
//     username: 'Sukh',
//     room: 'Devs'
// })

// addUser({
//     id:25,
//     username: 'Ash',
//     room: 'kids'
// })

// console.log('All users :' , users)

// const user = getUser(250)
// console.log(user)


// const userList = getUsersInRoom('Devs')
// console.log('All users in room', userList)
// const removedUser = removeUser(20)
// console.log('User removed = ', removedUser)

// console.log('All users :' , users)

// const res = addUser({
//     id:33,
//     username: 'TS',
//     room: 'devs'
// })

// console.log('All users again :' , res)