'use strict'

require('require-self-ref')

const fs = require('fs')
const path = require('path')
const decode = require('decode-html')
const Twitter = require('twitter')

let config

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
  return Promise.resolve(fs.readFileSync(path.join(__dirname, 'lastTweetId.txt')).toString())
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
  for (let replacement of config.replacements) {
    newText = newText.replace(replacement[0], replacement[1])
  }
  console.log('O: %s', originalText)
  console.log('N: %s', newText)
  return Promise.resolve(newText)
}

!async function () {
  //get tweets
  let tweets = await client.get('statuses/user_timeline', {screen_name: 'realDonaldTrump', tweet_mode: 'extended'})
  //filter out retweets and get most recent tweet
  tweets = tweets.filter((tweet) => {
    return tweet.retweeted_status ? false : true
  })
  let currentTweet = tweets[0]
  let currentTweetId = currentTweet.id
  let lastTweetId = await getLastTweetId()
  if (currentTweetId == lastTweetId) {
    console.log('no new tweets')
  } else {
    let text = await processTweet(currentTweet)
    await client.post('statuses/update', {status: text})
    //note the tweet that was just processed so that it doesn't get processed again
    recordLastTweetId(currentTweet)
  }
}()
  .catch(console.error)
