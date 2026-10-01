const fs = require('fs');


// will check whether the file already exist or not
if ( ! fs.existsSync('./docs')) {
    fs.mkdir('./docs', (err) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log('Directory Created');
        }
    });
    console.log('Wait Directory is creating......');

// if dir exist, then write a file on it
} else {
    // console.log('File Already exist');

    // checking whether the file is already exist or not
    if ( ! fs.existsSync('./docs/hellowww.txt')) {
        // fs.writeFile('./docs/hellowww.txt', 'hello successfully written', (err) => {

        // by changing the content the file will get re writte by the new content
        fs.writeFile('./docs/hellowww.txt', 'hey buddy! how are you doing?', (err) => {
            // print error
            if (err) {
                console.log(err.message, err.name);
            } else {
                console.log('File created succesfully');
            }
        });
        console.log('File is creating');
    } else {
        console.log('File is already exist');
    }
}