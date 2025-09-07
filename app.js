const express = require('express');
const bodyParser = require('body-parser');
const res = require("express/lib/response");
const app = express();
const bcrypt = require("bcrypt");
const sqlite3 =  require('sqlite3').verbose();  //pour creer et connecter la base de donnee
const url=require('url');
let sqL;
const db = new sqlite3.Database("mock.db",sqlite3.OPEN_READWRITE,(err)=>{
    if (err) return console.error(err.message);
});

app.use(bodyParser.json());

//post request

app.post('/mock',(req,res)=>{
    try {
        const {id,full_name,email,password} = req.body;
        sqL="INSERT INTO users(id,full_name,email,password) VALUES(?,?,?,?)"
        db.run(sqL,[id,full_name,email,password],(err)=>{
            if(err) return res.json({status: 300,success: false,error:err.message});

            console.log("Saisie réussie ",id,full_name,email,password);
            return  res.json({
                status: 200,
                success: true,
            });
        });
    } catch (error) {
        return res.json({
            status:400,
            success:false,
            error: error.message,
        });
    }
});
//POST register
app.post('/register', (req, res) => {
    const hash = bcrypt.hashSync(req.body.password, 10);
    db.run('INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)', [req.body.fullname, req.body.email, hash], (err) => {
        if (err) {
            return res.json({status: 300,success: false,error:err.message});
        } else {
            res.redirect('/login'); // Rediriger vers la page de connexion
        }
    });
});

//POST login
app.post('/login', (req, res) => {
    db.get('SELECT * FROM users WHERE email = ?', [req.body.email], (err, user) => {
        if (user && req.body.password===user.password) {
            // Utilisateur authentifié
           // res.redirect('/home'); // Rediriger vers la page d'accueil
        } else {
            // Échec de l'authentification
            res.redirect(':3000/login'); // Rediriger vers la page de connexion
        }
    });
});



//get request 

app.get("/mock",(req,res)=>{
    sqL="SELECT * FROM users";
    try {
        ////////////////pour chercher dans post le (KEY)field (par exemple:(VALUE)full_name) et le (KEY)type (par exemple: (VALUE)tala)
        const queryObject=url.parse(req.url,true).query;//its gonna bring our query parameters
        if(queryObject.field && queryObject.type) 
            sqL += ` WHERE ${queryObject.field} LIKE '%${queryObject.type}%'`;
        //////////////////////////////////////////////////////////////////////////////////////////////
        //exemple ici si on veut le nom Mohammad il va nous donner {queryObject.type} : ca veut avec son type peut email : slimmoudi ...
        db.all(sqL,[],(err,rows)=>{ //si on a pas err alors on a le callback rows
            if (err) return  res.json({status: 300,success: false,error:err});

            if(rows.length<1) return  res.json({status: 300,success: false,error:"No match"});

            return res.json({status:200,data:rows,success : true});
        })
    } catch (error) {
        return res.json({
            status:400,
            success: false,
        })
    }
})

app.listen(3000);