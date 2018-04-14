<template>

  <div v-cloak>
  <div v-if="false"></div>

  <div v-else-if="currentUserObj.id" id="main">
    <div id="matches-table" class="container">
      <app-header :currentUserObj="currentUserObj" :initialWeek="currentWeek" :maxWeek="maxWeek"></app-header>
      <matches-table :matches_computed="matches_computed"
                     :currentUserObj="currentUserObj"
                     :initialWeek="currentWeek"
                     :getUserScore="getUserScore"
                     :sorted_users="sorted_users"
                     :users="users"
      ></matches-table>
      <div v-if="false" class="col-md-2 users-table">
          <ol>
            <li v-for="user in sorted_users" :key="user.id">
              {{user.name}}
            </li>
          </ol>
      </div>

      <div v-if="(currentUserObj.isAdmin)" class="row" style="margin-top: 80px;">
        Become:
        <div v-for="user in users" :key="user.id" style="display: inline-block; margin: 4px;">
          <button class="btn btn-primary" @click="currentUserObj.id=user.id; currentUserObj.name=user.name">{{ user.name }}</button>
        </div>
      </div>
    </div> <!--container -->

  </div>
  <div v-else-if="($route.query.reg) && currentUserObj.id === 0">
    <registration-form></registration-form>
  </div>

  <div v-else-if="(currentUserObj.id == 0)">
    <login-form></login-form>
  </div>
</div>

</template>

<script>
import AppHeader from './AppHeader.vue'
import MatchesTable from './MatchesTable.vue'
import RegistrationForm from './RegistrationForm.vue'
import LoginForm from './LoginForm.vue'
import axios from 'axios'
var moment = require('moment')

let _data = {
  matches: [],
  currentUserObj: {},
  users: [],
  stageStart: moment('2018-04-03'),
  currentWeek: 1,
  maxWeek: 1
}

_data.matches = _data.matches.map((match, index) => {
  match.predictions = match.predictions.map((prediction, index) => {
    prediction.isResultGuessed = this._isScoreGuessed(prediction.score, match.result)
    prediction.isWinnerGuessed = this._isWinnerGuessed(prediction.score, match.result)
    return prediction
  })
  return match
})

export default {
  name: 'Vangothrone',
  data () {
    return _data
  },
  components: {
    AppHeader, MatchesTable, RegistrationForm, LoginForm
  },
  mounted () {
    this.getLoggedUser()
    this.currentWeek = this.weekNumber(moment())
  },
  methods: {
    getUsers: function () {
      axios.get('https://vang.aelnor.info/users').then(response => {
        this.users = response.data
      })
    },
    getUserScore: function (user, matches) {
      let scoreCount = 0
      matches.forEach(function (match) {
        if (match.predictions) {
          match.predictions.forEach(function (prediction) {
            if (prediction.userId === user.id) {
              if (prediction.isResultGuessed) {
                scoreCount += 3
              } else if (prediction.isWinnerGuessed) {
                scoreCount += 1
              }
            }
          })
        }
      })
      return scoreCount
    }
  },
  computed: {
    matches_computed () {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.matches = this.matches.sort((a, b) => { return moment(a.date) - moment(b.date) })
      let today = new Date()

      return this.matches.map((match, index) => {
        match.isPast = moment(match.date) < moment(today)
        this.$set(this.matches[index], 'editing', false)
        this.$set(this.matches[index], 'editingInfo', false)
        this.$set(this.matches[index], 'dateFormatted', moment(match.date).format('DD.MM.YYYY h:mm'))
        this.$set(this.matches[index], 'matchWeek', this.weekNumber(match.date))
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.maxWeek = match.matchWeek
        if (!match.predictions) {
          match.predictions = []
        }
        match.predictions = match.predictions.map((p, index) => {
          this.$set(match.predictions[index], 'editing', false)
          return p
        })
        return match
      })
    },
    sorted_users () {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      return this.users.sort((a, b) => { return this.getUserScore(b, this.matches) - this.getUserScore(a, this.matches) })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
body {
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
}
</style>
