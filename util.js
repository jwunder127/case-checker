const nullEntryError = 'null value for entry, make sure there are no empty lines in your data file';
const dict = require('./dictionary');
const wordnet = require('wordnet');
const Promise = require('bluebird');
Promise.promisifyAll(wordnet);


/*  --- UTILITY FUNCTIONS --- (presented in alphabetical order, see README for more info) */


function capitalizeFirstLetter(str){
  return str.charAt(0).toUpperCase() + str.slice(1);
}


function isAllCapitalized(description){
  const descriptionArr = description.split(' ');
  const removedLowerCaseWords = descriptionArr.filter(word => /[A-Z]/.test(word[0]));
  return descriptionArr.length === removedLowerCaseWords.length;
}


function lookupCasing(word, punctuation = ''){
  return wordnet.lookupAsync(word)
    .then(definitions => {
      const wordList = definitions[0].meta.words;

      //ensure that the wrong word isn't returned (e.g. wordnet returns 'toilet' for 'john' without this step)
      for (let i = 0; i < wordList.length; i++){
        if (wordList[i].word.toLowerCase() === word){
          return `${wordList[i].word}${punctuation}`;
        }
      }
      return `${word}${punctuation}`;
    })
    .catch(() => `${word}${punctuation}`);
}


function parseDescription(description, dictionary = dict){
  let newSentence = true;
  const parsedArray = [];
  const arrayToParse = description.split(' ').map(word => word.toLowerCase());

  for (let i = 0; i < arrayToParse.length; i++){

    let word = arrayToParse[i];

    if (newSentence
            &&
        dictionary[removePunctuation(word)]
            &&
        dictionary[removePunctuation(word)] === word.toUpperCase()){
      parsedArray.push(word.toUpperCase());
    }

    else if (newSentence){
      parsedArray.push(capitalizeFirstLetter(word));
    }
    //all single letters except `a` should be upper case
    else if (word.length === 1 && /[b-z]/.test(word)){
      parsedArray.push(word.toUpperCase());
    }

    else if (dictionary[removePunctuation(word)]){
      parsedArray.push(`${dictionary[removePunctuation(word)]}${returnOnlyPunctuation(word)}`);
    }

    else {
      let properCasing = lookupCasing(removePunctuation(word), returnOnlyPunctuation(word));
      parsedArray.push(properCasing);
    }
    //newSentence is true or false based on ending punctuation
    newSentence = /[.?!]/.test(word[word.length - 1]);
  }
  return parsedArray;
}


function removePunctuation(str){
  return str.match(/[A-Za-z0-9]/g) ?
  str.match(/[A-Za-z0-9]/g).join('') : '';
}


function returnOnlyPunctuation(str){
  return str.match(/[^A-Za-z0-9]/g) ?
  str.match(/[^A-Za-z0-9]/g).join('') : '';
}


function splitIdsAndDescriptions(data){
    const lineSplitData = data.split('\r');


    const idArr = [];
    const descriptionArr = [];

    for (let i = 0; i < lineSplitData.length; i++){
      //split each line on the first comma and remove the extra quotations marks
        let entry = lineSplitData[i].match(/([^,]*),(.*)/);
        if (!entry) throw nullEntryError;

        let id = entry[1];
        let currentDescription = entry[2].replace(/"/g, '');

        idArr.push(id);

        //if description is title case and needs to be parsed, do so, otherwise add to array (in promise form)
        let needsParsing = isAllCapitalized(currentDescription);
        if (needsParsing) {
          descriptionArr.push(parseDescription(currentDescription));

        } else {
          descriptionArr.push(currentDescription);
        }
    }

    return [idArr, descriptionArr];

}

module.exports = {
  capitalizeFirstLetter,
  isAllCapitalized,
  lookupCasing,
  parseDescription,
  removePunctuation,
  returnOnlyPunctuation,
  splitIdsAndDescriptions
};
