const nullEntryError = 'null value for entry, make sure there are no empty lines in your data file';
const dict = require('./dictionary');
const wordnet = require('wordnet');
const Promise = require('bluebird');
Promise.promisifyAll(wordnet);


/*  --- UTILITY FUNCTIONS --- (presented in alphabetical order)*/


/*
  capitalizeFirstLetter takes a string and capitalized the first letter
  e.g. cat => Cat
*/
function capitalizeFirstLetter(str){
  return str.charAt(0).toUpperCase() + str.slice(1);
}


/*
  isAllCapitalized takes a string and determines if each word in that string
  begins with a capital letter.
  e.g. "The dog fetched the stick" => false
       "The Dog Fetched The Stick" => true
*/

function isAllCapitalized(description){
  const descriptionArr = description.split(' ');
  const removedLowerCaseWords = descriptionArr.filter(word => /[A-Z]/.test(word[0]));
  return descriptionArr.length === removedLowerCaseWords.length;
}

/*
  lookupCasing utilizes wordnet's lookup function to estimate the proper
  casing of a word. The default output for wordnet.lookup is a word's
  definition. I've alterted that function slightly to return the word
  as it is written in the wordnet dictionary. For example, 'africa' would
  return 'Africa' because, as a proper noun, it is capitalized in the wordnet
  dictionary.

  lookupCasing also takes the punctuation at the end of a word (comma, period,
  etc.). Because wordnet will not find a word if there is punctuation attached
  to it (e.g. 'dog,' will not return 'dog' because of the comma at the end),
  I've separated the ending punctuation from the word during the lookup. The
  word returned from lookupCasing will have any applicable ending punctuation
  attached (e.g. 'africa,' is parsed down to 'africa' for the lookup, but is
  returned as 'Africa,')

  Edge case issue: hyphenated words. Because the punctuation is removed from
  the word and added to the end, hyphenated words such as 'life-saving' will
  become 'lifesaving-'. In the given csv, there were no hyphenated words.

  wordnet.lookup is an asynchronous function that has been 'promisified' into
  wordnet.lookupAsync. This allows the program to work with promises versus
  using callback functions. This makes for cleaner code.

  Edge case issue: If the word is not in the dictionary, the original word get
  returned. There are certain proper nouns that may not be stored in wordnet's
  database. If that is the case, they aren't properly capitalized in the output.
  A way to address this is with a more robust dictionary. Another issue that can
  come up is words used in different contexts; 'Bill' can be used as a person's
  name, and as something you pay every month. This program does not look at
  context to determine proper casing.
*/


function lookupCasing(word, punctuation = ''){
  return wordnet.lookupAsync(word)
    .then(definitions => {
      const wordList = definitions[0].meta.words;

      //ensure that the wrong word isn't returned (e.g. 'toilet' for 'john')
      for (let i = 0; i < wordList.length; i++){
        if (wordList[i].word.toLowerCase() === word){
          return `${wordList[i].word}${punctuation}`;
        }
      }
      return `${word}${punctuation}`;
    })
    .catch(() => `${word}${punctuation}`);
}

/*
  parseDescription takes a description (string of one or multiple sentences),
  converts it entirely into lower case, and determines which letters and words
  should be capitalized. The hierarchy of capitalization is as follows:

    1.If the word is in the dictionary as an all-caps word (e.g. 'er' is stored
      as 'ER'), then the entire word should be capitalized regardless of its
      location in the description.

    2.If condition 1 is not met, but the word is the first in the sentence, the
      first letter of the word should be capitalized. Edge case blind spot: if
      the word is not in the dictionary and is the first word of a sentence and
      SHOULD be all caps, the program will miss this. For example, if HIV (appearing as
      hiv in this function) were not in the dictionary, and came as the first
      word of the sentence, it would be returned as Hiv. It hiv were not the
      first word of a sentence, it would fall through to the lookup stage and
      be returned as HIV (as that is how the lookupCasing function would return
      it). At this point, it is a tradeoff. If the lookup function came first,
      words that might be lowercase would be returned as such. The asynchronous
      lookup makes this difficult. Solution would be to improve local dictionary.

    3.Words of a single letter (other than a) should be capitalized.

    4.If the word is already saved in the dictionary but doesn't fall under
      the above conditions, return that.

    5.If all else fails, look it up.

  At the end of each word, check for sentence-ending punctuation. If so, the next
  word should be the start of a new sentence. If not, the next word is part of
  the same sentence.

*/

function parseDescription(description, dictionary = dict){
  //uses global dictionary
  let newSentence = true;
  const parsedArray = [];
  const arrayToParse = description.split(' ').map(word => word.toLowerCase());

  for (let i = 0; i < arrayToParse.length; i++){
    //capitalize first letter of setenced
    //if word is in the dictionary, no need to look it up
    //punctuation isn't included in the dictionary
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
      // console.log(`${word} is in the dictionary`);
      parsedArray.push(`${dictionary[removePunctuation(word)]}${returnOnlyPunctuation(word)}`);
    }

    else {
      // console.log('looking up:', word);
      let properCasing = lookupCasing(removePunctuation(word), returnOnlyPunctuation(word));
      parsedArray.push(properCasing);
    }
    //newSentence is true or false based on ending punctuation
    newSentence = /[.?!]/.test(word[word.length - 1]);
  }
  return parsedArray;
}

/*
  removePunctuation takes a string (word) and cuts off any punctuation.
  The function returns all alphanumeric values in the string.

*/
function removePunctuation(str){
  return str.match(/[A-Za-z0-9]/g) ?
  str.match(/[A-Za-z0-9]/g).join('') : '';
}

/*
  returnOnlyPunctuation returns only the punctuation.
*/

function returnOnlyPunctuation(str){
  return str.match(/[^A-Za-z0-9]/g) ?
  str.match(/[^A-Za-z0-9]/g).join('') : '';
}

/*
  splitIdsAndDescriptions takes the data from the read file and parses it into
  two arrays: the ids and the descriptions. The regex match function ensures
  that the ids and descriptions are split on the first comma (i.e. commas in
  the middle of the description do not lead to split descriptions). The program
  also removes the excess double quotation marks as they are not needed once the
  ids and descriptions have been split. The double quotation marks will be added
  at the end of the program to ensure a clear division between ids and descriptions.

  Once the split is complete, the ids are pushed onto an array of ids and the
  descriptions are pushed onto an array of descriptions. The catch is whether or
  not the descriptions needs to be parsed (i.e. they are in title cased). Once
  that determination is made, the parsing process begins. However, the order of
  the descriptions is preserved.
*/
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
