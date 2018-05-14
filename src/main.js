// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import BootstrapVue from 'bootstrap-vue'
import router from './router'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import axios from 'axios'

Vue.config.productionTip = false
Vue.use(BootstrapVue)

var moment = require('moment')

Vue.mixin({
  methods: {
    getCurrentStageStartDate: function () {
      return moment('2018-05-15', 'YYYY-MM-DD')
    },
    weekNumber: function (m) {
      return Math.floor(moment(m).diff(this.getCurrentStageStartDate(), 'days') / 7) + 1
    },
    _isScoreGuessed: function (predictionScore, resultScore) {
      return (predictionScore === resultScore)
    },
    _isWinnerGuessed: function (predictionScore, resultScore) {
      if (resultScore === '') {
        return false
      }

      let team1PredictionScore = predictionScore[0]
      let team2PredictionScore = predictionScore[2]
      let team1ActualScore = resultScore[0]
      let team2ActualScore = resultScore[2]

      if ((team1ActualScore && team2ActualScore && team1PredictionScore && team2PredictionScore) && ((team1ActualScore > team2ActualScore && team1PredictionScore > team2PredictionScore) ||
        (team1ActualScore < team2ActualScore && team1PredictionScore < team2PredictionScore) ||
        (team1ActualScore === team2ActualScore && team1PredictionScore === team2PredictionScore))) { return true } else { return false }
    },
    getMatches: function () {
      axios.get('https://vang.aelnor.info/matches', {withCredentials: true}).then(response => {
        // response.data = data_matches; // mock
        this.matches = response.data.map((match, index) => {
          if (match.predictions) {
            match.predictions = match.predictions.map((prediction, index) => {
              prediction.isResultGuessed = this._isScoreGuessed(prediction.score, match.result)
              prediction.isWinnerGuessed = this._isWinnerGuessed(prediction.score, match.result)
              return prediction
            })
          }
          return match
        })
      })
    },
    getLoggedUser: function () {
      axios.get('https://vang.aelnor.info/login', {withCredentials: true}).then((response) => {
        if (response.data.id) {
          this.currentUserObj = response.data
          this.getMatches()
          this.getUsers()
        } else {
          this.currentUserObj = {id: 0}
        }
      })
    },
    logout: function () {
      axios.get('https://vang.aelnor.info/logout', {withCredentials: true})
        .then(response => {
          if (response.data.status === 'OK') {
            this.getLoggedUser()
          }
        })
    }
  }
})
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
