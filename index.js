const fs = require('fs');
const Promise = require('bluebird');
Promise.promisifyAll(fs);

/*
  This program uses a variety of utility functions. Check out util.js to
  see them and the README file to learn more about how they work.
*/
const splitIdsAndDescriptions = require('./util').splitIdsAndDescriptions;


const startTime = Date.now(); //for tracking the performance of the program


/*
  correctFile is the main function that governs the behavior of this program
*/
function correctFile(){

  /*
    Step 1: Read file, put ids in one array and descriptions in another array
            When splitting the ids and descriptions, this helper function also
            determines which descriptions are in 'title case' (first letter in
            each word is capitalized). The parsing process on those descriptions
            begins
  */

  fs.readFileAsync('data.csv', 'utf8')
    .then(data => {
      const [idArr, descriptionArr] = splitIdsAndDescriptions(data);


  /*
    Step 2: Once the ids and descriptions have been separated, they can be
            mapped into the output which the write method (coming up) will
            use to produce a new file. However, because the process of
            parsing and correcting some of the sentences is asynchronous (see
            the README for more), the program has been instructed to wait for
            the parsing to complete before writing the file.
  */


      Promise.map(descriptionArr, (individualDescription) => {
        if (typeof individualDescription === 'string'){
          return `"${individualDescription}"`;
        } else {
          return Promise.all(individualDescription)
            .then(fixedDescription => `"${fixedDescription.join(' ').trim()}"`);
        }
      })
        .then(parsedDescriptionArr => {
          let outputText = '';
          for (let i = 0; i < parsedDescriptionArr.length; i++){
            outputText += `${idArr[i]},${parsedDescriptionArr[i]}\r`;
          }


  /*
    Step 3: Now that the output text has been completely parsed and prepped
            to be written into a csv (commas, newlines, and double quotation
            marks included), the program will created an output called
            'newdata.csv' and save it in the current directory.
  */

        fs.writeFileAsync('newdata.csv', outputText)
          .then(() => console.log('file written', 'time elapsed:', (Date.now() - startTime) / 1000, 'seconds'))
          .catch(err => console.error(err));
      });


    })
      .catch(err => console.error(err)); //print an errors that stop the process.
}


/*--- START SCRIPT ----*/
console.log('starting script');
correctFile();
