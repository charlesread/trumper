'use strict'

require('require-self-ref')

const fs = require('fs')
const path = require('path')
const decode = require('decode-html')
const Twitter = require('twitter')

const hashtagTrump = ' #trump'
const atRealDonaldTrump = ' @realDonaldTrump'

let config
const replacements = require('~/lib/replacements')

try {
  config = require('~/config')
} catch (err) {
  throw new Error('cannot find config.js, did you `cp config.js.example config.js`?')
}

const client = new Twitter(config.twitter)

function recordLastTweetId(tweet) {
  fs.writeFileSync(path.join(__dirname, 'lastTweetId.txt'), tweet.id)
  return Promise.resolve()
}

function getLastTweetId() {
  return Promise.resolve(parseInt(fs.readFileSync(path.join(__dirname, 'lastTweetId.txt')).toString()))
}

function processTweet(tweet) {
  let originalText = decode(tweet.full_text)
  let newText = originalText
  let numberOfLinks = (newText.match(/http/gi) || []).length
  //get rid of the last link
  if (numberOfLinks > 0) {
    newText = newText.substring(0, newText.lastIndexOf(" "))
  }
  //process replacements
  for (let replacement of replacements) {
    newText = newText.replace(replacement[0], replacement[1])
  }

  //add tags if we can
  if ((newText + atRealDonaldTrump + hashtagTrump).length <= 140) {
    newText = newText + atRealDonaldTrump + hashtagTrump
  } else if ((newText + atRealDonaldTrump).length <= 140) {
    newText = newText + atRealDonaldTrump
  } else if ((newText + hashtagTrump).length <= 140) {
    newText = newText + hashtagTrump
  }

  console.log('O: %s', originalText)
  console.log('N: %s', newText)
  return Promise.resolve(newText)
}

!async function () {
  console.log('\n-- %s --', new Date())
  //get tweets
  let tweets = await client.get('statuses/user_timeline', {screen_name: 'realDonaldTrump', tweet_mode: 'extended'})
  //filter out retweets and get most recent tweet
  tweets = tweets.filter((tweet) => {
    return !tweet.retweeted_status
  })

  let currentTweet = tweets[0]
  let currentTweetId = currentTweet.id
  let lastTweetId = await getLastTweetId()
  if (currentTweetId === lastTweetId) {
    console.log('no new tweets')
  } else {
    let text = await processTweet(currentTweet)
    await client.post('statuses/update', {status: text})
    //note the tweet that was just processed so that it doesn't get processed again
    recordLastTweetId(currentTweet)
  }
}()
  .catch(console.error)
