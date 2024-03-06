const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const mysql = require("mysql");

app.use(cors({
    origin: 'http://localhost:3000'
}));

//Conexão com o banco
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "banco",
}); 

app.get("/", (req, res) => {
    db.query("INSERT INTO usuarios (email, password) VALUES ('kali@gmail.com', '12345')",
    (err, result) => {
        if (err) {
            console.log(err);
        }
    }
    );
});

app.use(express.json());
app.use(cors());

app.post("/register", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // iSSO NAO DEIXA CADASTRAR DOIS EMAILS IGUAIS
    db.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, result) => {
        if (err) {
            res.send(err);
        }

        //Não tem email igual
        if (result.length == 0) {
            bcrypt.hash(password, saltRounds, (err, hash) => {
            db.query("INSERT INTO usuarios (email, password) VALUES (? , ?)", //(?,?) == DINACIMO
            [email, hash], 
            (err, result) => {
                if(err) {
                    res.send(err);
                }

                    res.send({msg: "Cadastrado!"})
                }
            );
        })  
        } else {
            res.send({msg: "Usuário já cadastrado!"});
        }

        res.send(result);
    })
});

app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    db.query("SELECT * FROM usuarios WHERE email = ?", 
    [email], 
    (err, result) => {
        if (err) {
            res.send(err);
        }

        bcrypt.compare(password, result[0].password, 
        (err, result) => {
            if (result) {
                res.send("Usuário logado com sucesso!");
            } else {
                res.send("Senha ou usuário não encontrado!");
            }
        })
        
        
    })
});

app.listen(3001, () => {
    console.log('Servidor rodando!')
});