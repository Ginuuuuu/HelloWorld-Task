import exp from "express";
import { createUserCheckScheme } from "../utils/validationSchema.mjs";
import { checkSchema, validationResult, matchedData } from "express-validator";
import { users, students } from "../utils/constants.mjs";
import { studfindIndex } from "../utils/helper.mjs";
const route = exp();

route.get("/api/students/:id", (req, res)=>{
    // converting string to int
    const id = parseInt(req.params.id);
    const user = users.find((user) => user.id ===id);
    res.send(user);
    console.log(user);
});

route.get("/api/students", (req, res)=>{
    // converting string to int

    // users?filter=susername&values=go
    res.cookie("BigBuddy", "heyyyy", {maxAge:60000});
    const {query:{filter, values}} = req;
    if (filter && values) {
        console.log(filter, values);
        return res.send(users.filter(((user)=>user[filter].toLowerCase().includes(values))));
    }
    console.log(users);
    res.status(200).send(users);
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

// patch is used to update a particular element from a table 
route.patch("/api/students/:id", studfindIndex, (req, res) => {
    // GETTING THE PARAMETER ID, AND FINDING THE INDEX OF THAT
    // const StudID = parseInt(req.params.id);
    // if (isNaN(StudID)){
    //     return res.status(400).send({msg: "Bad Request"});
    // }
    // const studentsIndex = students.findIndex((students) => students.id ===StudID);
    // // res.send(userIndex);
    // if(studentsIndex === -1){
    //     return res.status(400).send({msg: "User Not Found, Invalid Request"});
    // }

    const studentsIndex = req.studentsIndex;
    const {body} = req;
    students[studentsIndex] = {...students[studentsIndex], ...body};
    res.status(201).send(students[studentsIndex]);
    console.log(students[studentsIndex]);

});

// PUT REQUEST WILL UPDATE THE ENTIRE ROW OF THE PARTICULAR COLUMN BASED ON THE GIVEN PARAMETERS
route.put("/api/users/:id", (req, res) => {
    // GETTING THE PARAMETER ID, AND FINDING THE INDEX OF THAT
    const id = parseInt(req.params.id);
    if (isNaN(id)){
        return res.status(400).send({msg: "Bad Request"});
    }
    const userIndex = users.findIndex((user) => user.id ===id);
    // res.send(userIndex);
    if(userIndex === -1){
        return res.status(400).send({msg: "User Not Found, Invalid Request"});
    }
    // GETTING THE CHANGES AND UPDATING INTO THE PARTUCULAR ROW BASED ON THE INDEX
    const {body} = req;
    users[userIndex] = {id: id, ...body};
    res.status(201).send({msg: "User Updated"});
    console.log(body);
    // console.log(req.put);
});


route.delete("/api/students/:id", studfindIndex, (req, res) => {
    // // GETTING THE PARAMETER ID, AND FINDING THE INDEX OF THAT
    // const StudID = parseInt(req.params.id);
    // if (isNaN(StudID)){
    //     return res.status(400).send({msg: "Bad Request"});
    // }
    // const studentsIndex = students.findIndex((students) => students.id ===StudID);
    // // res.send(userIndex);
    // if(studentsIndex === -1){
    //     return res.status(400).send({msg: "User Not Found, Invalid Request"});
    // }

    const studentsIndex = req.studentsIndex;
    const {body} = req;
    students[studentsIndex] = {...students[studentsIndex], ...body};
    students.splice(studentsIndex, 1);
    res.status(200).send(students);
    console.log(students);

});

export default route;