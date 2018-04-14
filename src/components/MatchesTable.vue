<template>
  <div class="row">
    <div class="col-md-12">
      <div class="row table-header" style="text-align: center">
        <div style="display: inline-block" class="col-md-2">Teams</div>
        <div style="display: inline-block" class="col-md-2">Date</div>
        <div style="display: inline-block" class="col-md-1" v-for="user in sorted_users" :key="user.id">{{ user.name }} ({{ getUserScore(user, matches_computed)}})</div>
        <div style="display: inline-block" class="col-md-1">Actual Result</div>
      </div>

      <div v-for="match in matches_computed" :key="match.id" v-if="match.matchWeek == currentWeek" class="row">
        <span v-if="(currentUserObj.isAdmin)" class="editable-match" @click="match.editingInfo = true"></span>
        <div v-if="!match.editingInfo" style="display: inline-block" class="match-teams col-2">
          <img class="team-logo" v-bind:src="teams[match.teams[0]] ? teams[match.teams[0]].iconUrl : ''" v-bind:title="teams[match.teams[0]] ? teams[match.teams[0]].name : ''">
          {{ teams[match.teams[0]] ? teams[match.teams[0]].code : match.teams[0] }}
          {{ teams[match.teams[1]] ? teams[match.teams[1]].code : match.teams[1] }}
          <img class="team-logo" v-bind:src="teams[match.teams[1]] ? teams[match.teams[1]].iconUrl : ''" v-bind:title="teams[match.teams[1]] ? teams[match.teams[1]].name : ''">
        </div>
        <div v-if="!match.editingInfo" style="display: inline-block" class="match-date col-md-2">
          {{ moment(match.date).format("D.MM.YYYY, HH:mm") }}
          <div class="is-match-passed">
            {{ match.isPast ? 'Already passed' : 'Yet to come'}}
          </div>
        </div>
        <div v-if="!match.editingInfo" v-for="user in users" :key="user.id" style="display: inline-block" class="match-prediction col-md-1">
          <div v-for="prediction in match.predictions" :key="prediction.id">
            <div v-if="prediction.userId == user.id">
              <div v-if="(user.id == currentUserObj.id) || (match.isPast)">
                <div v-if="!prediction.editing">
                    <span class="text" @click="prediction.userId == currentUserObj.id && !match.isPast && enableEditing(prediction)"
                          v-bind:class="{ editable: prediction.userId == currentUserObj.id && !match.isPast, 'right-prediction': prediction.isResultGuessed, 'winner-guessed': prediction.isWinnerGuessed }">
                       {{ prediction.score }}
                    </span>
                </div>
                <div v-if="prediction.editing">
                  <form>
                    <div class="input-group">
                      <input type="text" class="form-control form-control-sm" v-model="prediction.score">
                      <div class="input-group-append">
                        <button @click="(e) => {e.preventDefault(); saveEditPrediction(prediction, match.result, match.id)}" class="btn btn-outline-success btn-sm">&#10003;</button>
                        <button @click="(e) => {e.preventDefault(); disableEditing(prediction)}" class="btn btn-outline-danger btn-sm">&#10007;</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div v-else-if="matchHasUserPrediction(match, user.id)">
                &#9940;
              </div>
            </div>
          </div>
          <div v-show="(!matchHasUserPrediction(match, currentUserObj.id) && currentUserObj.id == user.id && !match.isPast)" class="create-prediction-div">
            <button @click="createPrediction(match, currentUserObj.id);" class="btn btn-sm btn-info">+</button>
          </div>

          </div>
          <div v-if="!match.editingInfo" style="display: inline-block" class="match-results col-1">

              <div v-if="!match.editing">
                <span class='text' v-bind:class="{ editable: (!match.resultFrozen && match.isPast) }" @click="!match.resultFrozen && enableEditing(match)">{{ match.result != '' ? match.result : 'TBD' }}</span>
              </div>

              <div v-if="match.editing">
                <form>
                  <div class="input-group">
                    <input type="text" class="form-control form-control-sm" v-model="match.result">
                    <div class="input-group-append">
                      <button @click="(e) => {e.preventDefault(); saveEditResult(match)}" class="btn btn-outline-success btn-sm">&#10003;</button>
                      <button @click="(e) => {e.preventDefault(); disableEditing(match)}" class="btn btn-outline-danger btn-sm">&#10007;</button>
                    </div>
                  </div>
                </form>
              </div>
        </div>
        <div v-if="(currentUserObj.isAdmin) && (match.editingInfo)">
          <form class="form-inline">
              <input style="width: 60px; margin-right: 5px;" class="input-sm form-control" v-model.lazy="match.teams[0]">
              <input style="width: 60px" class="input-sm form-control" v-model.lazy="match.teams[1]">
              <input type="text" class="input-sm form-control" v-model="match.dateFormatted">

            <button style="margin-left: 10px" @click="(e) => {e.preventDefault(); editMatch(match); match.editingInfo = false}" class="btn btn-success btn-sm">Save</button>
            <button style="margin-left: 10px" class="btn btn-danger btn-sm" @click="(e) => {e.preventDefault(); match.editingInfo = false;}">Cancel</button>
          </form>
        </div>
      </div>
      <div v-if="(currentUserObj.isAdmin) && (addMatchFormVisible)" class="form-group row" style="margin-left: 20px;">

                <form class="form-inline">
                    <input style="width: 60px; margin-right: 5px;" class="input-sm form-control" v-model="addMatchTeam1">
                    <input style="width: 60px" class="input-sm form-control" v-model="addMatchTeam2">
                    <div class="input-group date" style="margin-left: 45px;" id="datetimepicker1" data-target-input="nearest">
                    <input v-model="addMatchDateTimeReadable" class="input-sm form-control">
                      <!--<input type="text" class="form-control datetimepicker-input" id="input-datepicker1" v-model="addMatchDateTime" data-target="#datetimepicker1"/>-->
                      <!--<div class="input-group-append" data-target="#datetimepicker1" data-toggle="datetimepicker">-->
                        <!--<div class="input-group-text"><i class="fa fa-calendar"></i></div>-->
                      <!--</div>-->
                    </div>

                  <button style="margin-left: 10px" @click="(e) => {e.preventDefault(); addMatch()}" class="btn btn-success btn-sm">Add!</button>
                  <button style="margin-left: 10px" class="btn btn-danger btn-sm" @click="(e) => {e.preventDefault(); addMatchFormVisible = false;}">Cancel</button>
                </form>

      </div>
    <div v-if="(currentUserObj.isAdmin == true) && (!addMatchFormVisible)"><button class="btn btn-info btn-sm" @click="addMatchFormVisible = true;" style="margin-left: 15px;">Add Match</button></div>

    </div>
  </div>
</template>

<script>
import axios from 'axios'

var moment = require('moment')

var dataTeams = {
  'SHD': {
    'name': 'Shanghai Dragons',
    'code': 'SHD',
    'iconUrl': '/static/icons/dragons.png'
  },
  'SEO': {
    'name': 'Seoul Dynasty',
    'code': 'SEO',
    'iconUrl': '/static/icons/dynasty.png'
  },
  'NYE': {
    'name': 'New York Excel',
    'code': 'NYE',
    'iconUrl': '/static/icons/new-york-excelsior.webp'
  },
  'DAL': {
    'name': 'Dallas Fuel',
    'code': 'DAL',
    'iconUrl': '/static/icons/fuel.png'
  },
  'PHI': {
    'name': 'Philadelphia Fusion',
    'code': 'PHI',
    'iconUrl': '/static/icons/fusion.png'
  },
  'GLA': {
    'name': 'Los Angeles Gladiators',
    'code': 'GLA',
    'iconUrl': '/static/icons/gladiators.png'
  },
  'HOU': {
    'name': 'Houston Outlaws',
    'code': 'HOU',
    'iconUrl': '/static/icons/outlaws.png'
  },
  'SFS': {
    'name': 'San Francisco Shock',
    'code': 'SFS',
    'iconUrl': '/static/icons/shock.png'
  },
  'LDN': {
    'name': 'London Spitfire',
    'code': 'LDN',
    'iconUrl': '/static/icons/spitfire.png'
  },
  'BOS': {
    'name': 'Boston Uprising',
    'code': 'BOS',
    'iconUrl': '/static/icons/uprising.png'
  },
  'VAL': {
    'name': 'Los Angeles Valiant',
    'code': 'VAL',
    'iconUrl': '/static/icons/valiant.png'
  },
  'FLA': {
    'name': 'Florida Mayhem',
    'code': 'FLA',
    'iconUrl': '/static/icons/mayhem.png'
  }
}

export default {

  name: 'MatchesTable',
  props: ['currentUserObj', 'matches_computed', 'getUserScore', 'sorted_users', 'users', 'initialWeek'],
  data () {
    return {
      addMatchFormVisible: false,
      addMatchTeam1: '',
      addMatchTeam2: '',
      addMatchDateTime: '',
      addMatchDateTimeReadable: '',
      teams: dataTeams,
      moment: moment,
      currentWeek: 1
    }
  },
  mounted () {
    this.currentWeek = this.initialWeek
    this.$root.$on('changeWeek', weekNo => {
      this.currentWeek = weekNo
    })
  },
  watch: {
    initialWeek: function (weekNo) {
      this.currentWeek = weekNo
    },
    addMatchDateTimeReadable: function (val) {
      this.addMatchDateTime = moment(val).format('YYYY-MM-DDTHH:mm:ssZ')
    }
  },
  methods: {
    enableEditing: function (item) {
      item.editing = true
    },
    disableEditing: function (item) {
      item.editing = false
    },
    editMatch: function (match) {
      match.date = moment(match.dateFormatted, 'DD.MM.YYYY H:mm').format('YYYY-MM-DDTHH:mm:ssZ')
      // match.date = moment(this.$('#input-datepicker2').val(), 'DD.MM.YYYY hh:mm').format('YYYY-MM-DDTHH:mm:ssZ')
      axios.put(
        'https://vang.aelnor.info/matches/' + match.id,
        {
          'teams': [match.teams[0], match.teams[1]],
          'date': match.date
        },
        {
          headers: {'Content-Type': 'application/json'}
        }
      )
    },
    addMatch: function () {
      this.addMatchDateTime = moment(this.addMatchDateTimeReadable, 'DD.MM.YYYY h:mm').format('YYYY-MM-DDTHH:mm:ssZ')
      axios.post('https://vang.aelnor.info/matches',
        {
          'teams': [this.addMatchTeam1, this.addMatchTeam2],
          // 'date': moment(this.addMatchDateTime, "DD.MM.YYYY hh:mm").format("YYYY-MM-DDTHH:mm:ssZ")
          'date': this.addMatchDateTime
        },
        {headers: {'Content-Type': 'application/json'}}).then((response) => {
        this.$parent.matches.push({
          id: response.data.id,
          teams: [this.addMatchTeam1, this.addMatchTeam2],
          date: moment(this.addMatchDateTime).format('YYYY-MM-DDTHH:mm:ssZ'),
          result: '',
          resultFrozen: false,
          predictions: []
        })
        // this.$parent.getMatches()

        this.addMatchFormVisible = false
        this.addMatchTeam1 = ''
        this.addMatchTeam2 = ''
        this.addMatchDateTime = ''
      })
    },
    saveEditPrediction: function (item, resultScore, matchId) {
      axios.put(
        'https://vang.aelnor.info/predictions',
        {
          'userId': this.currentUserObj.id,
          'matchId': matchId,
          'score': item.score
        },
        {withCredentials: true},
        {headers: {'Content-Type': 'application/json'}}
      ).then((response) => { })
      this.disableEditing(item)
    },
    saveEditResult: function (item) {
      axios.put(
        'https://vang.aelnor.info/matches/' + item.id,
        {
          'result': item.result
        },
        {
          headers: {'Content-Type': 'application/json'}
        }
      ).then((response) => { this.$parent.getMatches() })
      this.disableEditing(item)
    },
    matchHasUserPrediction: function (match, userId) {
      if (!match.predictions) {
        return false
      }
      return match.predictions.find(function (element) {
        return element.userId === userId
      })
    },
    createPrediction: function (match, userId) {
      if (!this.matchHasUserPrediction(match, userId)) {
        match.predictions.push({userId: userId, editing: true, prediction: '0:0', isResultGuessed: false, isWinnerGuessed: false})
      }
    }
  }
}
</script>

<style>
span.editable::after {
  content: "";
  background-image: url('https://www.iconexperience.com/_img/o_collection_png/green_dark_grey/512x512/plain/edit.png');
    background-size: 20px 20px;
    width: 20px;
    height: 20px;
    display: inline-block;
}
span.editable-match::after {
  content: "";
  position: absolute; left: -20px;
  background-image: url('https://www.iconexperience.com/_img/o_collection_png/green_dark_grey/512x512/plain/edit.png');
    background-size: 20px 20px;
    width: 20px;
    height: 20px;
    display: inline-block;
}
.right-prediction {
  font-weight:bold;
}
.winner-guessed {
  color: green;
}
img.team-logo {
  width: auto;
  height: 30px
}
div.match-prediction {
  text-align: center
}
div.match-results {
  text-align: center
}

div.match-teams {
  text-align: center
}

.match-date {
  text-align: left
}

div.is-match-passed {
  font-size: 10px;
}
div.container {
  margin: 40px;
  max-width: 1600px;
}
div.table-header {
  font-weight: bold;
  margin-bottom: 10px;
}
div#matches-table {
  margin-left: 100px;
}
</style>
