const socket = io;

socket.on('chat-message', data => {
    console.log(data);
})