export const studfindIndex = (req, res, next) => {
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
}