import exp from "express";
/* import { createUserCheckScheme } from "./utils/validationSchema.mjs";
import { checkSchema, validationResult, matchedData } from "express-validator";
import { studfindIndex } from "./utils/helper.mjs"; */
/* import studentrout from "./router/studentRouter.mjs";
import userRout from "./router/userRouter.mjs"; */
import router from "./router/Router.mjs";
import { users, students } from "./utils/constants.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
import { Strategy as localStrategy } from "passport-local";
import passport from "passport";

const PORT = 4001;

const app = exp();

// GETTING POST REQUEST AS JSON FILE AND PROCESSING IT
app.use(exp.json());

// get cookies in proper format
app.use(cookieParser("encrypt"));

app.use(
    session({
        // a random non-guessable name for secret
        secret: "sfuidfusdgfuisgf",
        // will not save the random visits && it will not store anything until storing data forcefull in the particular endpoint
        saveUninitialized: false,
        // will save only if anything is saved to the prior saved stuff || will not force to create another session to store data
        resave: false,
        cookie: {
            maxAge: 60000 * 60
        }
    }
));

app.use(passport.initialize());                 /* initalising the password authenticator */
app.use(passport.session());                    /* initalising the password session */

/* middleware for password authenticator */
passport.use( new localStrategy (
    {usernameField: "sname", passwordField: "password"},        /* initialising the field name */
    (sname, password, done) => {
    const student = students.find((student)=> student.sname === sname);
    if(!sname) {
        return done(null, false, {err: "Invalid User"});
    }
    if(student.password !== password) {
        return done(null, false, {err: "Incorrect password"});
    }
    return done(null, student);
}));

// serialize the login
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// deserialize the login
passport.deserializeUser((id, done) => {
    const user = students.find((user)=> user.id === id);
    done(null, user||false);
});

app.use(router);

app.get('/', (req, res)=>{
    res.cookie("user", "admin", {maxAge: 600000 * 60, signed: true});
    console.log(req.session.id);
    req.sessionStore.get(req.session.id, (err, sessionData) => {
        if(err){
            console.log(err);
        } else {
            console.log(sessionData);
        }
    });
    res.send({id: "eee", welcome: "Welcome daaa"});
});

// login page || intake of credentials
app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if(err) {
            return next(err);
        }
        if(!user){
            return res.status(403).json({message: info?.message} || "Login Failed");
        }
        req.logIn(user, (err) => {
            if(err){
                return next(err);
            }
            return res.json({message: "Login Successfull", user});
        });
    }) (req, res, next);
});

/* const users = [
    {id: 1, susername: "Reshin"},
    {id: 2, susername: "Ginu"},
    {id: 3, susername: "Anizan"},
    {id: 4, susername: "Paul"},
    {id: 5, susername: "cfyguigyt"}
]

const students = [
    {id:1, sname: "Reshin", class:12, age:19},
    {id:2, sname: "Anizan", class:12, age:19},
    {id:3, sname: "Paul", class:9, age:15},
    {id:4, sname: "Smith", class:10, age:16},
    {id:5, sname: "Ginu", class:8, age:14},
    {id:6, sname: "ughvguy", class:10, age:15},
    {id:7, sname: "tfycvubh", class:12, age:19},
    {id:8, sname: "cccccccc", class:1, age:5}
] */

/* const studfindIndex = (req, res, next) => {
    const StudID = parseInt(req.params.id);
    if(isNaN(StudID)) {
        return res.status(400).send({msg: "Bad Request , Invalid"});
    }
    const studentsIndex = students.findIndex((students) => students.id ===StudID);
    if (studentsIndex === -1) {
        return res.status(400).send({msg: "User not Found"});
    }
    req.studentsIndex = studentsIndex;
    next();
} */

/* app.get('/api/users/:id', (req, res)=>{
    // converting string to int
    const id = parseInt(req.params.id);
    const user = users.find((user) => user.id ===id);
    res.send(user);
    console.log(user);
});

app.get('/api/students/:id', (req, res)=>{
    // converting string to int
    const id = parseInt(req.params.id);
    const user = users.find((user) => user.id ===id);
    res.send(user);
    console.log(user);
}); */

/* app.get("/api/users", (req, res)=>{
    // converting string to int

    // users?filter=susername&values=go
    const {query:{filter, values}} = req;
    console.log(filter, values);
    res.send(users.filter(((user)=>user[filter].toLowerCase().includes(values))));

    console.log(user);
}); */

/* app.get("/api/students", (req, res)=>{
    // converting string to int

    // users?filter=susername&values=go
    const {query:{filter, values}} = req;
    console.log(filter, values);
    res.send(users.filter(((user)=>user[filter].toLowerCase().includes(values))));

    console.log(users);
}); */

// GETTING POST REQUEST AND THEN STORING IN IN THE USER ARAY
// app.post("/api/students", checkSchema(createUserCheckScheme), (req, res) => {
//     /* console.log(req['express-validator#contexts']); */
//     const result = validationResult(req);
//     /* console.log(result); */
//     if (!result.isEmpty()) {
//         return res.status(400).send({errMsg:result.array()});
//     }
//     /* will give all the element from the req body
//     const {body} = req; */

//     /* use matcheddata to take only the validated Data && no need for character restructuring */
//     const body = matchedData(req);
//     const newUser = {id: users[users.length-1].id+1, ...body};
//     users.push(newUser);
//     res.status(201).send(newUser);
// });

/* // PUT REQUEST WILL UPDATE THE ENTIRE ROW OF THE PARTICULAR COLUMN BASED ON THE GIVEN PARAMETERS
app.put("/api/users/:id", (req, res) => {
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
}); */

/* // patch is used to update a particular element from a table 
app.patch("/api/students/:id", studfindIndex, (req, res) => {
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


app.delete("/api/students/:id", studfindIndex, (req, res) => {
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

}); */

app.listen(PORT, () => {
    console.log(`The PORT ${PORT} is listening.......`);
});
