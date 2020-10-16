const path = require('path');
const express = require('express');
const app = express();
const http = require('http')
const socketio = require('socket.io');
const formatMessage = require('./utils/message');
const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./utils/users');


app.use(express.static(path.join(__dirname,'public')));
const server = http.createServer(app);
const io = socketio(server);
const botName= 'chatBot'

io.on(
    'connection',
    socket => {
        //
        socket.on('joinRoom',({username,room}) => {
          const user = userJoin(socket.id, username, room);
          socket.join(user.room);
          //welcome current user
          socket.emit("message", formatMessage(botName, "Welcome to chatApp"));

          //broadcast when user connects
          socket.broadcast
            .to(user.room)
            .emit(
              "message",
              formatMessage(botName, `${user.username} has joined chat`)
            );

          //send users and room info
          io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room),
          });
        })

        
        
        socket.on("chatMessage", (msg) => {
            const user = getCurrentUser(socket.id);
            io.to(user.room).emit('message',formatMessage(user.username,msg));
        });

        //when client disconnects
        socket.on('disconnect',() => {
            const user = userLeave(socket.id);
             if(user){
                 io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`))

                 io.to(user.room).emit("roomUsers", {
                   room: user.room,
                   users: getRoomUsers(user.room),
                 });

                }
        })

    }
)


const PORT = process.env.PORT || 3000

server.listen(PORT, () => console.log(`running on port ${PORT}`));