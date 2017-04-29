# About

Who doesn't love Donald Trump?!  Let's make his tweets more accurate by making some corrections!

This little Twitter "bot" finds Trump's latest tweet, changes a few things around, and posts it to the Twitter account of your choice! (currently @realD0naldTr0ll).

# Installation

`git clone <repo>`

`cd trumper`

`npm install`

`cp config.js.example config.js` (fill out your Twitter app info)

`node index.js`

# Notes

Run `index.js` as much as you like, I have it running every minute via `cron`.

Replacements are made according to the [`Regex`, `String`] arrays in `config.js`.

Have fun!

# Contribution

Fork me to some changes or additions and maybe I'll redeploy the app pointed at @realD0naldTr0ll!