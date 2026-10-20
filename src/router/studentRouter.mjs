import route from "express";

route.get('/api/students/:id', (req, res)=>{
    // converting string to int
    const id = parseInt(req.params.id);
    const user = users.find((user) => user.id ===id);
    res.send(user);
    console.log(user);
});

route.get("/api/students", (req, res)=>{
    // converting string to int

    // users?filter=susername&values=go
    const {query:{filter, values}} = req;
    console.log(filter, values);
    res.send(users.filter(((user)=>user[filter].toLowerCase().includes(values))));

    console.log(users);
});

// GETTING POST REQUEST AND THEN STORING IN IN THE USER ARAY
route.post("/api/students", checkSchema(createUserCheckScheme), (req, res) => {
    /* console.log(req['express-validator#contexts']); */
    const result = validationResult(req);
    /* console.log(result); */
    if (!result.isEmpty()) {
        return res.status(400).send({errMsg:result.array()});
    }
    /* will give all the element from the req body
    const {body} = req; */

    /* use matcheddata to take only the validated Data && no need for character restructuring */
    const body = matchedData(req);
    const newUser = {id: users[users.length-1].id+1, ...body};
    users.push(newUser);
    res.status(201).send(newUser);
});


export default route;