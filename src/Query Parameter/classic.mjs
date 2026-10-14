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

app.get('/api/users/:id', (req, res)=>{
    // converting string to int
    const id = parseInt(req.params.id);
    const user = users.find((user) => user.id ===id);
    res.send(user);
    console.log(user);
})

app.get("/api/users", (req, res)=>{
    // converting string to int

    // users?filter=susername&values=go
    const {query:{filter, values}} = req;
    console.log(filter, values);
    res.send(users.filter(((user)=>user[filter].toLowerCase().includes(values))));

    console.log(user);
});

// GETTING POST REQUEST AS JSON FILE AND PROCESSING IT
app.use(exp.json());

// GETTING POST REQUEST AND THEN STORING IN IN THE USER ARAY
app.post("/api/users", (req, res) => {
    console.log(req.body);
    const {body} = req;
    const newUser = {id: users[users.length-1].id+1, ...body};
    users.push(newUser);
    res.status(201).send(newUser);
});

// PUT REQUEST WILL UPDATE THE ENTIRE ROW OF THE PARTICULAR COLUMN BASED ON THE GIVEN PARAMETERS
app.put("/api/users/:id", (req, res) => {
    // GETTING THE PARAMETER ID, AND FINDING THE INDEX OF THAT
    const id = parseInt(req.params.id);
    if (isNaN(id)){
        return res.status(400).send({msg: "Bad Request"});
    }
    const userIndex = users.findIndex((user) => user.id ===id);
    // res.send(userIndex);
    if(userIndex === -1){
        return res.status(404).send({msg: "User Not Found, Invalid Request"});
    }
    // GETTING THE CHANGES AND UPDATING INTO THE PARTUCULAR ROW BASED ON THE INDEX
    const {body} = req;
    users[userIndex] = {id: id, ...body};
    res.status(201).send({msg: "User Updated"});
    console.log(body);
    // console.log(req.put);
})

app.listen(PORT, () => {
    console.log(`The PORT ${PORT} is listening.......`);
});
