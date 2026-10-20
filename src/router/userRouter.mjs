import exp from "express";
import { users, students } from "../utils/constants.mjs";

const route = exp();

route.get('/api/users/:id', (req, res)=>{
    // converting string to int
    const id = parseInt(req.params.id);
    const user = users.find((user) => user.id ===id);
    res.send(user);
    console.log(user);
});

route.get("/api/users", (req, res)=>{
    if (users.length != 0){
        res.status(200).send(users);
        return console.log(users);
    }
    res.status(400).send({err: "users are empty"});
});

route.get("/api/users", (req, res)=>{
    // converting string to int

    // users?filter=susername&values=go
    const {query:{filter, values}} = req;
    console.log(filter, values);
    res.send(users.filter(((user)=>user[filter].toLowerCase().includes(values))));

    console.log(users);
});

export default route;