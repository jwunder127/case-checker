# Welcome to Case Checker!

## Limitations
* me returns as ME (state abbreviation)
* some names won't work (John returns as john)
  *need to manually add exceptions to the dictionary
*who corrects to WHO (World Health Organization) added who to dictionary
*regional modifiers (e.g. 'west' in 'West Africa') are not picked up
*Assumes that all non-title case sentences are correct. E.g. 'One Stop Shop for Senior Services'

## Utility Function Descriptions

### capitalizeFirstLetter
/*
  capitalizeFirstLetter takes a string and capitalized the first letter
  e.g. cat => Cat
*/
### isAllCapitalized
/*
  isAllCapitalized takes a string and determines if each word in that string
  begins with a capital letter.
  e.g. "The dog fetched the stick" => false
       "The Dog Fetched The Stick" => true
*/
### lookupCasing
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

  wordnet.lookup is an asynchronous function that has been 'promisified' into
  wordnet.lookupAsync. This allows the program to work with promises versus
  using callback functions. This makes for cleaner code.
*/
### parseDescription
/*
  parseDescription takes a description (string of one or multiple sentences),
  converts it entirely into lower case, and determines which letters and words
  should be capitalized. The hierarchy of capitalization is as follows:

    1.If the word is in the dictionary as an all-caps word (e.g. 'er' is stored
      as 'ER'), then the entire word should be capitalized regardless of its
      location in the description.
*/
### removePunctuation
### returnOnlyPunctuation
### splitIdsAndDescriptions

## Misc
Separated utility functions from main file for ease of testing and a separation
of concerns



