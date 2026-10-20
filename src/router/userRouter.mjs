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
    // converting string to int

    if(req.signedCookies.user && req.signedCookies.user === "admin") {
        /* //  before cookie-parser
        console.log(req.headers.cookie); */

        // after cookie-parser
        console.log(req.signedCookies);
        // users?filter=susername&values=go
        const {query:{filter, values}} = req;
        if(filter && values) {
            console.log(filter, values);
            return res.send(users.filter(((user)=>user[filter].toLowerCase().includes(values))));
        }
        res.status(200).send(users);
        return console.log(users);
    }
    res.status(400).send({err: "To list users you must need admin cookie"});

});

export default route;