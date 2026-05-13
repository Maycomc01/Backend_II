const socket = io();

socket.on("new-product", product => {
    console.log(product)
})
