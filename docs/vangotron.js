// import 'moment';

var data_teams = {
  "SHD": {
    "name": "Shanghai Dragons",
    "code": "SHD",
    "iconUrl": "icons/dragons.png"
  },
  "SEO": {
    "name": "Seoul Dynasty",
    "code": "SEO",
    "iconUrl": "icons/dynasty.png"
  },
  "NYE": {
    "name": "New York Excel",
    "code": "NYE",
    "iconUrl": "icons/new-york-excelsior.webp"
  },
  "DAL": {
    "name": "Dallas Fuel",
    "code": "DAL",
    "iconUrl": "icons/fuel.png"
  },
  "PHI": {
    "name": "Philadelphia Fusion",
    "code": "PHI",
    "iconUrl": "icons/fusion.png"
  },
  "GLA": {
    "name": "Los Angeles Gladiators",
    "code": "GLA",
    "iconUrl": "icons/gladiators.png"
  },
  "HOU": {
    "name": "Houston Outlaws",
    "code": "HOU",
    "iconUrl": "icons/outlaws.png"
  },
  "SFS": {
    "name": "San Francisco Shock",
    "code": "SFS",
    "iconUrl": "icons/shock.png"
  },
  "LDN": {
    "name": "London Spitfire",
    "code": "LDN",
    "iconUrl": "icons/spitfire.png"
  },
  "BOS": {
    "name": "Boston Uprising",
    "code": "BOS",
    "iconUrl": "icons/uprising.png"
  },
  "VAL": {
    "name": "Los Angeles Valiant",
    "code": "VAL",
    "iconUrl": "icons/valiant.png"
  },
  "FLA": {
    "name": "Florida Mayhem",
    "code": "FLA",
    "iconUrl": "icons/mayhem.png"
  }
};

function getCurrentStageStartDate() {
  const stageStart = moment('2018-04-03');
  return stageStart
}

function weekNumber(m) {

  return Math.floor(moment(m).diff(getCurrentStageStartDate(), 'days')/7) + 1;
}


data = {
  matches: [],
  teams: data_teams,
  users: [],
  currentUserObj: {},
  credentials: {
    login: '',
    password: ''
  },
  registerCredentials: {
    username: '',
    login: '',
    password: ''
  },
  maxWeek: 1,
  addMatchFormVisible: false,
  addMatchTeam1: '',
  addMatchTeam2: '',
  addMatchDateTime: '',
  loginFormError: '',
  currentWeek: weekNumber(moment())
};

function _isScoreGuessed(predictionScore, resultScore){
      return (predictionScore == resultScore)
    };

function _isWinnerGuessed(predictionScore, resultScore){
  if (resultScore == '') {
    return false
  }

  team1PredictionScore = predictionScore[0];
  team2PredictionScore = predictionScore[2];
  team1ActualScore = resultScore[0];
  team2ActualScore = resultScore[2];

  if ((team1ActualScore && team2ActualScore && team1PredictionScore && team2PredictionScore) && ((team1ActualScore > team2ActualScore && team1PredictionScore > team2PredictionScore) ||
    (team1ActualScore < team2ActualScore && team1PredictionScore < team2PredictionScore) ||
      (team1ActualScore == team2ActualScore && team1PredictionScore == team2PredictionScore))) {return true} else {return false}
}

data.matches = data.matches.map ( (match, index) => {
  match.predictions = match.predictions.map( (prediction, index) => {
    prediction.isResultGuessed = _isScoreGuessed(prediction.score, match.result);
    prediction.isWinnerGuessed = _isWinnerGuessed(prediction.score, match.result);
    return prediction;
  });
  return match;
});

var router = new VueRouter({
    mode: 'history',
    routes: []
});

var app = new Vue({
  router,
  el: '#app',
  data: data,
  mounted() {
    $('#datetimepicker1').datetimepicker({
      locale: 'ru',
      format: 'DD.MM.YYYY, hh:mm'
    });
    $('#datetimepicker2').datetimepicker({
      locale: 'ru',
      format: 'DD.MM.YYYY, hh:mm'
    });
    // get matches data
    //axios.get("https://pages.github.com")
    // get current user
    this.getLoggedUser();

  },
  computed: {
      sorted_users() {
        return this.users.sort((a, b) => { return this.getUserScore(b, this.matches) - this.getUserScore(a, this.matches);});
      },
      matches_computed() {
        this.matches = this.matches.sort((a, b) => {return moment(a.date) - moment(b.date)});
        var today = new Date();

        return this.matches.map( (match, index) => {
            match.isPast = moment(match.date) < moment(today);
            this.$set(this.matches[index], 'editing', false);
            this.$set(this.matches[index], 'editingInfo', false);
            this.$set(this.matches[index], 'matchWeek', weekNumber(match.date));
            this.maxWeek = match.matchWeek;
            if (!match.predictions) {
              match.predictions = [];
            };
              match.predictions = match.predictions.map( (p, index) => {
              this.$set(match.predictions[index], 'editing', false);
              return p;
             });
            return match
        })
      },
  },
  methods: {
    editMatch: function(match){
      match.date = moment($('#input-datepicker2').val(), "DD.MM.YYYY hh:mm").format("YYYY-MM-DDTHH:mm:ssZ")
      axios.put(
        "https://vang.aelnor.info/matches/" + match.id,
        {
          "teams": [match.teams[0], match.teams[1]],
          "date": match.date
        },
        {
          headers: {"Content-Type": "application/json"}
        }
      );


    },
    enableEditing: function(item){
      item.editing = true;
    },
    disableEditing: function(item){
      item.editing = false;
    },
    saveEditPrediction: function(item, resultScore, matchId){
      axios.put(
        "https://vang.aelnor.info/predictions",
        {
          "userId": this.currentUserObj.id,
          "matchId": matchId,
          "score": item.score
        },
        {withCredentials: true},
        {headers: {"Content-Type": "application/json"},
      }
    ).then((response) => {this.getMatches()});
      this.disableEditing(item);
    },
    saveEditResult: function(item){
      item.predictions.forEach(function(prediction) {
        prediction.isResultGuessed = _isScoreGuessed(prediction.score, item.result);
        prediction.isWinnerGuessed = _isWinnerGuessed(prediction.score, item.result);
      });
      axios.put(
        "https://vang.aelnor.info/matches/" + item.id,
        {
          "result": item.result
        },
        {
          headers: {"Content-Type": "application/json"}
        }
      ).then((response) => {this.getMatches()});
      this.disableEditing(item);
    },
    matchHasUserPrediction: function(match, userId){
      if (!match.predictions) {
        return false;
      };
      return match.predictions.find(function(element) {
        return element.userId == userId;
      });
    },
    createPrediction: function(match, userId){
      if (!this.matchHasUserPrediction(match, userId)) {
        match.predictions.push({userId: userId, editing: true, prediction: "0:0", isResultGuessed: false, isWinnerGuessed: false})
      };
      //console.log($('.create-prediction-div'));
    },
    sendLoginForm: function() {
      axios.post("https://vang.aelnor.info/login", {"login": this.credentials.login, "password": this.credentials.password}, {withCredentials: true})
        .then((response) => {
          this.getLoggedUser();
          if (response.data.status == 'Failed') {
            this.loginFormError = response.data.text
          };
        })
    },
    sendRegisterForm: function() {
      alert('Not implemented! Please make roochka.');
    },
    logout: function() {
      axios.get("https://vang.aelnor.info/logout", {withCredentials: true})
        .then(response => {if (response.data.status == "OK") {
          this.getLoggedUser();
        }})
    },
    getLoggedUser: function() {
      axios.get("https://vang.aelnor.info/login", {withCredentials: true}).then((response) => {
        if (response.data.id) {
          this.currentUserObj = response.data;
          this.getMatches();
          this.getUsers();
        } else {
          this.currentUserObj = {id: 0};
        }

      })
    },
    getUserScore: function(user, matches){
      scoreCount = 0;
      matches.forEach(function(match) {
        if (match.predictions) {
          match.predictions.forEach(function(prediction) {
            if (prediction.userId == user.id) {
              if (prediction.isResultGuessed) {
                scoreCount += 3;
              } else if (prediction.isWinnerGuessed) {
                scoreCount += 1;
              }
            }
          })
        }
      });
      return scoreCount
    },
    addMatch: function() {
      this.addMatchDateTime = $('#input-datepicker1').val();
      axios.post(
        "https://vang.aelnor.info/matches",
        {
          "teams": [this.addMatchTeam1, this.addMatchTeam2],
          "date": moment(this.addMatchDateTime, "DD.MM.YYYY hh:mm").format("YYYY-MM-DDTHH:mm:ssZ")
        },
        {headers: {"Content-Type": "application/json"}}).then((response) => {
          this.matches.push({
            id: response.data.id,
            teams: [this.addMatchTeam1, this.addMatchTeam2],
            date: moment(this.addMatchDateTime, "DD.MM.YYYY hh:mm").format("YYYY-MM-DDTHH:mm:ssZ"),
            result: "",
            resultFrozen: false,
            predictions: []
          });
          //this.getMatches();
          this.addMatchFormVisible = false;
          this.addMatchTeam1 = '';
          this.addMatchTeam2 = '';
          this.addMatchDateTime = '';
        })
    },
    getUsers: function() {
      axios.get("https://vang.aelnor.info/users")
      .then(response => {
        this.users = response.data;
      });
    },
    getMatches: function() {
      axios.get("https://vang.aelnor.info/matches", {withCredentials: true})
      .then(response => {
        //response.data = data_matches; // mock
        this.matches = response.data.map ( (match, index) => {
          if (match.predictions) {
              match.predictions = match.predictions.map( (prediction, index) => {
              prediction.isResultGuessed = _isScoreGuessed(prediction.score, match.result);
              prediction.isWinnerGuessed = _isWinnerGuessed(prediction.score, match.result);
              return prediction;
            })};
          return match;
          }
      )});
    },  // end method
  } // end methods
});
