const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const apiKey = 'RGAPI-638f24e6-d6a2-4687-96fe-d8ec082e0517';

var SummonerName;
var SummonerId;
var Level;
var TotalMastery;
var IconId;
var ToLookup;
var SoloRank;
var FiveRank;
var ThreeRank;
var isLiveGame;


app.get('/static_info', (req, res) => {
  res.send({default: 'Test',})
});


app.post('/summoner_lookup', (req, res) => {
  ToLookup = req.body.toLookup;

  getSummoner(res);
});


function getSummoner(props){
  axios.get('https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + ToLookup + '?api_key=' + apiKey)
  .then(sumRes => {
    console.log('Summoner: ');
    console.log(sumRes.data);
    SummonerName = sumRes.data.name;
    Level = sumRes.data.summonerLevel;
    IconId = sumRes.data.profileIconId;
    SummonerId = sumRes.data.id;
    getMastery(props);
  });

}

function getMastery(props){
  axios.get('https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/' + SummonerId + '?api_key=' + apiKey)
  .then(res => {
    console.log('Mastery:');
    console.log(res.data[0]);
    MostMastery = res.data[0].championId;

    getRank(props);
  })

}

function getRank(props){
  axios.get(' https://na1.api.riotgames.com/lol/league/v4/positions/by-summoner/' + SummonerId + '?api_key=' + apiKey)
  .then(res =>{
    if(res.data.length > 0)
    {
      for(var i = 0; i < res.data.length; i++){
        var temp = res.data[i].tier + " " + res.data[i].rank;
        console.log(temp);
        switch (res.data[i].queueType){
          case "RANKED_SOLO_5x5":
            SoloRank = temp;
          break;
          case "RANKED_TEAM_5x5":
            FiveRank = temp;
          break;
          case "RANKED_TEAM_5x5":
            ThreeRank = temp;
          break;
        }
      }
    }
    getLiveGame(props);
  })


}

function getLiveGame(props){
  axios.get('https://na1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/' + SummonerId + '?api_key=' + apiKey)
  .then(res =>{
    isLiveGame = true;
  })
  .catch(e =>{
      isLiveGame = false;
  })
  .then(end =>{
    sendData(props);
  })

}

function sendData(props){
  props.send({
    SummonerName: SummonerName,
    Level: Level,
    IconId: IconId,
    isLiveGame: isLiveGame,
    MostMastery: MostMastery,
    SoloRank: SoloRank,
    FiveRank: FiveRank,
    ThreeRank: ThreeRank,
  });
}



app.listen(port, () => console.log(`Listening on port ${port}`));