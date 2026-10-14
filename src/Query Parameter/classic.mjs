import exp from "express";
// import { values } from "lodash";

const app = exp();

const PORT = 4001;

const users = [
    {id: 1, susername: "Reshin"},
    {id: 2, susername: "Ginu"},
    {id: 3, susername: "Anizan"},
    {id: 4, susername: "Paul"},
    {id: 5, susername: "BhaAni"}
]

app.get('/', (req, res)=>{
    res.send({id: "eee", welcom: "Welcome daaa"});
});

// app.get('/api/users', (req, res)=>{
//     res.send(users);
// });

app.get("/api/users", (req, res)=>{
    // converting string to int

    // users?filter=susername&values=go
    const {query:{filter, values}} = req;
    console.log(filter, values);
    res.send(users.filter(((user)=>user[filter].toLowerCase().includes(values))));

    console.log(user);
});

app.listen(PORT, () => {
    console.log(`The PORT ${PORT} is listening.......`);
});
