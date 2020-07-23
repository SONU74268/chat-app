const Filter = require('bad-words')
const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const { generateMessage, generateLocationMessage } = require('./utils/generateMessage')
const { addUsers, removeUser, getUser, getUsersInRoom} = require('./utils/users')
const { error } = require('console')

const port = process.env.PORT || 9000

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const setDirectryPath = path.join(__dirname, '../public')
app.use(express.static(setDirectryPath))

// let count = 0

io.on('connection', (socket) => {
    console.log('new WebSocket connection ')
    
    // socket.emit('countUpdate', count)

    // socket.on('increment', () => {
    //     count++
    //     io.emit('countUpdate', count)
    // })
    
    socket.on('join', (options, callback) => {
        const { error, user }= addUsers({ id: socket.id, ...options})
        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        
        io.to(user.room).emit('roomdata', {
            room : user.room,
            users : getUsersInRoom(user.room)
        })

        callback()
    })
    
    socket.on('sendmessage', (message , callback) => {
        
        const getuser = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }
        io.to(getuser.room).emit('message', generateMessage(getuser.username, message))
        callback()
    })

    socket.on('sendlocation', (location, callback) => {
        const getuser = getUser(socket.id)
        io.to(getuser.room).emit('locationMessage', generateLocationMessage(getuser.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))    
            io.to(user.room).emit('roomdata', {
                room : user.room,
                users : getUsersInRoom(user.room)
            })
        }    
    })
})

server.listen(port, () => {
    console.log('server is up on port ' + port)
})