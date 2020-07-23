const users = []

//adding a user
const addUsers = ({id, username, room}) => {

    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the user
    if (!username || !room) {
        return  {
            error: 'username and room are required!'
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.username === username && user.room === room
    })

    //validate existing user
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    //store user
    const user = {id, username, room}
    users.push(user)
    return {user}

}

const removeUser = (id) => {
    const userindex = users.findIndex( (user) =>  user.id === id )

    if (userindex !== -1) {
        return users.splice(userindex, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room )
}

module.exports = {
    addUsers,
    removeUser,
    getUser,
    getUsersInRoom
}