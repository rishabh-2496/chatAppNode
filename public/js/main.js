const socket = io();
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById('room-name')
const userList = document.getElementById("users");
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

console.log(username,room)
const outputMessage = function(message){
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
                    <p class="text">
                        ${message.text}
                    </p>`;
    chatMessages.appendChild(div)

}


const outputRoomName = function (room) {
    roomName.innerText = room;
}


const outputUsers = function(users) {
userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`
}

//join chat room
socket.emit('joinRoom',{username,room})

//get room and users
socket.on('roomUsers',({room,users}) => {
    console.log(room)
    outputRoomName(room);
    outputUsers(users)
})


//on receiving message from server
socket.on('message',message => {
    console.log(message)
    outputMessage(message)
    chatMessages.scrollTop = chatMessages.scrollHeight
})

//message submit
chatForm.addEventListener('submit',(e) =>{
    e.preventDefault();
    const msg = e.target.elements.msg.value;
    console.log(msg)
    //emitting a message to server
    socket.emit('chatMessage',msg)
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus();
})