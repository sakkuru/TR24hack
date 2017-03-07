const restify = require('restify');
const builder = require('botbuilder');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const LuisEndpoint = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/944db7c6-15ef-4c82-96fa-d06efd81a203?subscription-key=7ed743a99e1d4b07a5d463474b906ff4";

// Setup Restify Server
const server = restify.createServer();
server.use(bodyParser.urlencoded({
  extended: true
}));
server.use(bodyParser.json());

server.listen(process.env.port || process.env.PORT || 3978, function() {
  console.log('%s listening to %s', server.name, server.url);
});

const sendTextToLUIS = (text, callback) => {
  const options = {
    url: LuisEndpoint,
    method: 'GET',
    qs: {
      q: text
    }
  };
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(JSON.parse(response.body));
    }
  });
}

const getWordList = json => {
  let wordList = [];
  for (let e in json.entities) {
    let entity = json.entities[e].entity;
    if (entity) {
      wordList.push(entity);
    }
  }
  return wordList;
}

server.post('/text', (req, res, next) => {
  const text = req.body.text;
  let wordList = [];

  sendTextToLUIS(text, json => {
    const wordList = getWordList(json);
    console.log("wordList", wordList);
    getRSS(wordList, rssList => {
      res.send(rssList);
    });
  });
  res.send('Text data was inputted.');
});