const fs = require('fs');

fs.readFile(`./Input/append.txt`, `utf-8`, (err, data1) => {
    if (err) 
        return console.log(`Hell! No file found`)
    fs.readFile(`./Input/${data1}.txt`, `utf-8`, (err, data2) => {
        console.log(data2)
        fs.readFile(`./Input/text.txt`, `utf-8`, (err, data3) => {
            console.log(data3)
            fs.writeFile(`./Input/written.txt`, `${data1}\n${data2}\n${data3}`, `utf-8`, err => {
                if (err)
                    return console.log(`File not found to write`)
                else
                    return console.log(`file written`)
            })
        })
    })
})
console.log(`File is reading`)