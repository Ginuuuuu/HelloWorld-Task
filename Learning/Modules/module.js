const names = ['reshin', 'ginu', 'anizan'];

// console.log(names);


// single export
// module.exports = names;

const ages = [21, 19, 31, 21, 12, 134,];
const year = [2007, 2008, 1999, 1995];


// multiple export
// two types of export, with name and without name
// module.exports = {
//     names, ages, year,
// };

module.exports = {
    per: names,
    vayasu: ages,
    varusham: year,
};