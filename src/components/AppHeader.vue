<template>
  <div class="row" style="margin-bottom: 40px">

    <div class="col-2">
      <div style="display: inline-block">
        <img src='../assets/logo.jpg' class="main-logo" @click="$parent.getMatches()">
      </div>
    </div>
    <div class="col-8">

        <div class="row" style="font-size: 24px; font-weight: bold; text-align: center">OWL Dosvidooley Vangothrone</div>
        <div class="row" style="font-size: 20px; text-align: center">Hello, {{ currentUserObj.name }}!</div>
        <div class="row" style="margin-top: 5px">
          <div class="btn-group btn-group-toggle btn-group-sm" role="group" aria-label="Choose Week">
            <label v-for="index in maxWeek" :key="index" @click="selectWeek(index)" class="btn btn-light" v-bind:class="{active: index == currentWeek}">
              <input type="radio" name="options" :id="'option'+index" autocomplete="off" checked> Week {{ index }}
            </label>
          </div>
        </div>

    </div>
    <div class="col-md-1">
      <button class="btn btn-sm btn-outline-info" @click="$parent.logout()">Logout</button>
    </div>

  </div>
</template>

<script>
export default {

  name: 'AppHeader',
  props: ['currentUserObj', 'initialWeek', 'maxWeek'],
  data () {
    return {
      currentWeek: 1
    }
  },
  mounted () {
    this.selectWeek(this.initialWeek)
  },
  methods: {
    selectWeek: function (weekNo) {
      this.currentWeek = weekNo
      this.$root.$emit('changeWeek', weekNo)
    }
  },
  watch: {
    initialWeek: function (weekNo) {
      this.currentWeek = weekNo
    }
  }
}
</script>

<style>
  .main-logo {
    height: auto;
    width: auto;
    max-width: 150px;
    max-height: 150px;
}
</style>
