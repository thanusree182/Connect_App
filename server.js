const express = require('express')
const app = express()
// const cors = require('cors')
// app.use(cors())
//built-in server
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
//importing uuid library
const { v4: uuidV4 } = require('uuid')

app.use('/peerjs', peerServer);
//used to assign the setting name to value
app.set('view engine', 'ejs')
app.use(express.static('public'))

//URL we are going to hit
app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })   //it is room id parameter
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId);
    // messages
    socket.on('message', (message) => {
      //send message to the same room
      io.to(roomId).emit('createMessage', message)
  }); 

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

//server is the local host and port is 3030
server.listen(3030)
