/* eslint-disable no-unused-expressions */

/* Testing framework */
const chai = require('chai');
const expect = chai.expect;
const spies = require('chai-spies');
chai.use(spies);


/* Utility functions to test */
const capitalizeFirstLetter = require('./util').capitalizeFirstLetter;
const isAllCapitalized = require('./util').isAllCapitalized;
const lookupCasing = require('./util').lookupCasing;
const parseDescription = require('./util').parseDescription;
const removePunctuation = require('./util').removePunctuation;
const returnOnlyPunctuation = require('./util').returnOnlyPunctuation;
const splitIdsAndDescriptions = require('./util').splitIdsAndDescriptions;


describe('capitalizeFirstLetter function', () => {
  const firstTrue = 'cat';
  const secondTrue = 'CAT';

  it('returns a capitalized version of the input', () => {
    expect(capitalizeFirstLetter(firstTrue)).to.equal('Cat');
  });
  it('will not affect a word that is already capitalized', () => {
    expect(capitalizeFirstLetter(secondTrue)).to.equal(secondTrue);
  });
});


describe('isAllCapitalized function', () => {
  const firstTrue = 'A Cat Eats The Cat Food';
  const firstFalse = 'a Cat eats the cat Food';

  it('returns true when each word begins with a capital letter', () => {
    expect(isAllCapitalized(firstTrue)).to.be.true;
  });
  it('returns false when each word does not begin with a capital letter', () => {
    expect(isAllCapitalized(firstFalse)).to.be.false;
  });
});


describe('lookupCasing function', () => {
  const capitalizeMe = lookupCasing('africa');
  const keepMeLowerCase = lookupCasing('dog');
  it('capitalizes words when appropriate', () => {
    return capitalizeMe
      .then(word => {
        expect(word).to.equal('Africa');
    });
  });
  it('keeps words lower case when appropriate', () => {
    return keepMeLowerCase
      .then(word => {
        expect(word).to.equal('dog');
    });
  });
});

describe('parseDescription function', () => {
  const firstStringToParse = 'heLLo WELcoMe tO manhattan';
  const secondStringToParse = 'hello, charlie. welcome to europe';
  const thirdStringToParse = 'john and i get discounts with my aaa and aarp cards';
  let firstParsedString, secondParsedString;
  const localDictionary = {
                      aaa: 'AAA',
                      aarp: 'AARP',
                      and: 'and',
                      john: 'John',
                      cards: 'cards',
                      discounts: 'discounts',
                      get: 'get',
                      my: 'my',
                      with: 'with',
                    };

  beforeEach('set up promises', () => {
    firstParsedString = parseDescription(firstStringToParse);
    secondParsedString = parseDescription(secondStringToParse);

  });
  it('returns an array', () => {
    return Promise.all(firstParsedString)
      .then(resolvedParsedString => {
        expect(resolvedParsedString).to.be.instanceof(Array);
      });
  });

  it('properly cases input', () => {
    return Promise.all(firstParsedString)
    .then(resolvedParsedString => {
      expect(resolvedParsedString.join(' ')).to.equal('Hello welcome to Manhattan');
    });
  });

  it('works with multi-sentence descriptions', () => {
    return Promise.all(secondParsedString)
      .then(resolvedParsedString => {
        expect(resolvedParsedString.join(' ')).to.equal('Hello, charlie. Welcome to Europe');
      });
  });

  it('uses a locally-supplied dictionary over external requests', () => {
    const spy = chai.spy(lookupCasing);
    parseDescription(thirdStringToParse, localDictionary);
    expect(spy).to.not.have.been.called();
  });
});


describe('removePunctuation function', () => {
  const firstTrue = 'r!e,a/d,m.,e';
  const secondTrue = ',.//.,;;!';
  const thirdTrue = 'a.bc;1/2.,3';

  it('removePunctuation from a given string', () => {
    expect(removePunctuation(firstTrue)).to.equal('readme');
  });
  it('will return an empty string when given all punctuation', () => {
    expect(removePunctuation(secondTrue)).to.equal('');
  });

  it('returns alphanumeric characters', () => {
    expect(removePunctuation(thirdTrue)).to.equal('abc123');
  });
});


describe('returnOnlyPunctuation function', () => {
  const firstTrue = 'i.d,o.n.t!;w;a,n.t,le;t.t/e,rs';
  it('returns only punctuation in a given string', () => {
    expect(returnOnlyPunctuation(firstTrue)).to.equal('.,..!;;,.,;./,');
  });
});


describe('splitIdsAndDescriptions function', () => {
  const fileOne = '1,go to the store.\r2,"hello are you?"';
  const fileTwo = '1,"go, now. to the store."\r2,"hello, friends, neighbors, and family"';
  it('splits ids and descriptions into different arrays', () => {
    const [ids, descriptions] = splitIdsAndDescriptions(fileOne);
    expect(ids).to.have.length(2);
    expect(descriptions).to.have.length(2);
  });
  it('works with descriptions that have multiple commas given double quotation marks', () => {
    const descriptions = splitIdsAndDescriptions(fileTwo)[1];
    expect(descriptions).to.have.length(2);
  });
});
