# Welcome to Case Checker!



## Overview
Case Checker will take a comma-separated value (csv) file of ids and descriptions, determine which descriptions are in title case (i.e. the first letter of each word in the description is capitalized), and properly parse them, adhering to sentence structure, proper nouns, and abbreviations.

## Getting Started
This program uses external libraries that require installation. If you have npm installed (included with node.js installation, see 'Main Tools' below), please run the following terminal command:
```sh
npm install
```
Alternatively, if you use [yarn](https://yarnpkg.com/lang/en/docs/install/), you can use:
```sh
yarn
```
Once the node modules are installed you can start the program using one of the following commands:
```sh
node index.js
```
or
```sh
npm start
```
Make sure you have a data.csv file saved to the case-checker directory (included with this repo). Once the program runs, you can check out your csv file at newdata.csv (also included with this repo).

## Testing
To test key functions of this program:
```sh
npm test
```

## Anatomy

### Main tools
This program was written in JavaScript using node.js. Node 7.10.0 was used in development. If you do not have node on your machine, you can [download it here](https://nodejs.org/en/download/current/).

In addition, this program uses the [bluebird promise library](http://bluebirdjs.com/docs/getting-started.html) and a [dictionary library](https://github.com/dariuszdziuk/wordnet) based on Princeton's [wordnet lexical database](http://wordnet.princeton.edu/wordnet/)

Mocha and chai were used as testing frameworks.

### File Structure
The primary script for this program is in index.js. This program makes use of utility functions (as described below), which are stored in util.js. A small dictionary with tricky casings is included in dictionary.js All tests are located in test.js.

### Utility Functions Overview
In an effort to write reusable code, this program uses a number of utility functions. The utility functions allow the program to be broken down into small, manageable tasks. See below for a detailed walkthrough of how they work.

#### capitalizeFirstLetter

capitalizeFirstLetter takes a string and capitalized the first letter e.g. cat => Cat

#### isAllCapitalized

isAllCapitalized takes a string and determines if each word in that string begins with a capital letter.
  e.g. "The dog fetched the stick" => false
       "The Dog Fetched The Stick" => true

#### lookupCasing
lookupCasing takes a word and any punctuation at the end of that word and outputs the proper casing of that word with the punctuation attached. It utilizes wordnet's lookup function to estimate the proper casing of a word. The default output for wordnet.lookup is a word's definition. I've altered that function slightly to return the word as it is written in the wordnet dictionary. For example, 'africa' would return 'Africa' because, as a proper noun, it is capitalized in the wordnet dictionary.

Because wordnet will not find a word if there is punctuation attached to it (e.g. 'dog,' will not return 'dog' because of the comma at the end), I've separated the ending punctuation from the word during the lookup. The word returned from lookupCasing will have any applicable ending punctuation attached (e.g. 'africa,' is parsed down to 'africa' for the lookup, but is returned as 'Africa,')

wordnet.lookup is an asynchronous function that has been 'promisified' into wordnet.lookupAsync. This allows the program to work with [promises](https://en.wikipedia.org/wiki/Futures_and_promises) versus using callback functions. This makes for cleaner code. Asynchronous functions allow for other processes in the program to occur while they work in the background. In this instance, the program can loop through other descriptions while waiting for a response from wordnet.lookup. Once all the lookups have completed, the program will move forward (eventually writing the parsed to an output file). Speaking of parsing descriptions...

### parseDescription
parseDescription takes a description (string of one or multiple sentences), converts it entirely into lower case, and determines which letters and words should be capitalized. The hierarchy of capitalization is as follows:

    1. If the word is in the dictionary as an all-caps word (e.g. 'er' is stored
      as 'ER'), then the entire word should be capitalized regardless of its
      location in the description.
    2. If condition 1 is not met, but the word is the first word in its sentence, the first letter of the word should be capitalized (see Limitations for an edge case that this will miss).
    3. Words of a single letter, other than the letter 'a', should be capitalized. When a single letter word is discovered in a description, it is almost always an initial and should be capitalized.
    4. If the word is already saved in the local dictionary, but doesn't fall under the above conditions, return the definition as stored in the local dictionary.
    5. If all else fails, look it up in wordnet.
After parsing each word, look at the last character of the word; does it signal the end of a sentence (.?!)? If so, the next word will be the beginning of a new sentence. The newSentence variable is set to `true`. The parseDescription function returns an array that contains strings and promises (objects that are 'promised' to become values eventually, but not yet--this is a cost of using asynchronous code).


### removePunctuation
removePunctuation does just that, it removes any punctuation from the string passed to it and returns only the alphanumeric characters in that string.

### returnOnlyPunctuation
returnOnlyPunctuation does just the opposite; it removes any alphanumeric characters from the string passed to it and returns everything else.

### splitIdsAndDescriptions
splitIdsAndDescriptions takes the data from the read file and parses it into two arrays: one containing the ids and another containing the descriptions. The regex match function ensures that the ids and descriptions are split on the first comma of each line (as separated by a carriage return). This means that commas in the middle of a description do not lead to split descriptions. The program also removes the excess double quotation marks as they are not needed once the ids and descriptions have been split up. The double quotation marks will be added at the end of the program to ensure a clear division between ids and descriptions.

Once the split is complete, the ids are pushed onto an array of ids and the descriptions are pushed onto an array of descriptions. The catch is whether or not a description needs to be parsed (i.e. whether or not they are titled cased). Once that determination is made, the parsing process begins. However, the order of descriptions is preserved--the id in the first index (position) of the id array will always be properly matched with the description in the first index of the description array.


## Limitations

### Context leads to unpredictable casing
The greatest limitation of this project deals with the often-times unpredictable casing of certain words. For example, when the program runs across the word 'bill', it has no context of whether or not this is a name (and should therefore be corrected to 'Bill') or something that you need to pay at the end of the month. Is 'who' a pronoun or an acronym for the World Health Organization ('WHO')? This program is limited in that it can only ever return one casing for a given word (unless the word comes at the start of a new sentence in which case 'bill' and 'Bill' would both become 'Bill').

This problem is difficult to address without writing a program that can effectively evaluate a word's context. In this project, a repeated source of context issues are modifiers to places. For example: 'north Carolina', 'new Jersey', or 'west Africa'. [Google's Natural Language API](https://cloud.google.com/natural-language/) might help to address this problem, but even that technology isn't foolproof (nor is it free at the scale required for this project).

### Dictionary limitations
A final wordnet-related limitation is the limitation of the dictionary itself. Not every word in the csv is in the wordnet dictionary, especially some proper nouns ('Calhoun', 'Cass', etc.). The lookupCasing function just returns the all lower case version of the word. My current solution to address this problem is to identify which proper nouns come back all lower case and add them and their proper casing to the local dictionary.

### Edge cases
As mentioned in the parseDescription section, the incorrect casing may be applied to a word if it is at the beginning of a sentence, but should be all caps. For example, if the word in the to-be-parsed sentence is 'Hiv', it should be corrected to 'HIV'. If the word falls in the middle of a sentence, it will be properly handled (falling under item #5 in the parseDescription hierarchy). However, if it is at the beginning of the sentence, it will fall under condition #2 and be returned as 'Hiv'. A potential solution for this problem is to lookup the word, get the dictionary casing ('HIV'), and if that word is all caps, have it supersede the word returned by condition #2. However, the asynchronous nature of the lookup makes this difficult; by the time the lookup is complete, the word has already been placed in its final array.


## Thanks for reading!





