import exp from "express";

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

app.get('/api/users', (req, res)=>{
    res.send(users);
});

app.get('/api/users/:id', (req, res)=>{
    // converting string to int
    const id = parseInt(req.params.id);
    const user = users.find((user) => user.id ===id);
    res.send(user);
    console.log(user);
})
app.listen(PORT, () => {
    console.log(`The PORT ${PORT} is listening.......`);
});
