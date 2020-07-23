const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')

const $messages = document.querySelector('#div-messages')

//template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#locationMessage-template').innerHTML
const sidebartemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = async () => {
    //new message element
    const $newmessage = $messages.lastElementChild

    //height of the new msg
    const newMessageStyle = getComputedStyle($newmessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newmessage.offsetHeight + newMessageMargin

    console.log(newMessageStyle)
    //visible height
    const visibleHeight = $messages.offsetHeight

    //Height of message container 
    const containerHeight = $messages.scrollHeight

    //How i far i scrolled down
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}

// socket.on('countUpdate', (count) => {
//     console.log('value is updated ', count)
// })

// document.querySelector('#update', addEventListener('click', () => {
//     console.log('click event occour')
//     socket.emit('increment')
// }))

socket.on('message', (msg) => {
    console.log(msg)
    const html = Mustache.render(messageTemplate, {
        username : msg.username,
        message : msg.text,
        createdAt : moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
   autoscroll()
})

socket.on('roomdata', ({room, users}) => {
    const html = Mustache.render(sidebartemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('locationMessage', (message, error) => {
    if (error) {
        return console.log(error)
    }
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    //disable button
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    socket.emit('sendmessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            console.log(error)
        }
        console.log('msg deliverd')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('your browser does not support geolocation')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendlocation', {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
            }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('location send succesfully!')
        } )
    })
})

socket.emit('join', { username, room}, (error) => {
    if (error) {
        alert(error)
        location.href='/'
    }
})