const express = require('express');
const http = require('http');
const socketIO = require('socket.io');


const app = express();


const server = http.createServer(app);


const io = socketIO(server);

const mongoose = require('mongoose');


const ejs = require('ejs');
const path = require('path');


app.use(express.static(path.join(__dirname, 'public')));
// console.log(path.join(__dirname, 'public'));


app.set('view', path.join(__dirname, 'public'));


app.engine('html', ejs.renderFile);


app.use('/', (req, res) => {
    res.render('index.html')
});

function connectDB() {
    let dbURL = 'mongodb+srv://BD3-NoSQL-AtlasMongoDB:Adamastor15@cluster0.a0a2b.mongodb.net/';

    mongoose.connect(dbURL);

    mongoose.connection.on('error', console.error.bind(console, 'connection error: '));

    mongoose.connection.once('open', function(){
        console.log('ATLAS MONGO DB CONECTADO COM SUCESSO!');
    });
}
connectDB();

let Message = mongoose.model('Message', {usuario:String, data_hora:String, message:String});



// Lógica do Socket.io - Envio e propagação de mensagens


// Array que simula o banco de dados
let messages = [];

Message.find({})
    .then(docs=>{
       messages = docs
    }).catch(error=>{
        console.log(error);
    });

// Estrutura de conexão do Socket.io
io.on('connection', socket => {


    // Teste de conexão
    console.log('NOVO USUÁRIO CONECTADO: ' + socket.id);


    // Recupera e mantém (exibe) as mensagens entre front e o back
    socket.emit('previousMessage', messages);


    // Lógica de chat quando uma mensagem é enviada
    socket.on('sendMessage', data => {


        // Adiciona a mensagem no final do array de mensagens
        // messages.push(data);

        let message = new Message(data);

        message.save()
            .then(
                    socket.broadcast.emit('receiveMessage', data)
            )
            .catch(error=>{
                console.log(error);
            });

    


        console.log('QTD MENSAGENS: ' + messages.length);


    });


    console.log('QTD MENSAGENS: ' + messages.length);


});




server.listen(3000, () => {
    console.log('CHAT RODANDO EM - HTTP://localhost:3000')
});
