<template>
  <div class="container">
      <div class="row">

        <div class="absolute-center is-responsive">
          <form>
          <div class="logo-container"></div>
          <h1>{{ $route.query.reg }}</h1>
          <div class="form-group">
            <span class="input-group-addon"><i class="glyphicon glyphicon-user"></i></span>
              <input
                type="text"
                class="form-control"
                placeholder="Enter your login"
                v-model="registerCredentials.login"
              >
            </div>
            <div class="form-group">
              <span class="input-group-addon"><i class="glyphicon glyphicon-user"></i></span>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Enter your shown username"
                  v-model="registerCredentials.username"
                >
            </div>
            <div class="form-group">
              <input
                type="password"
                class="form-control"
                placeholder="Enter your password"
                v-model="registerCredentials.password"
              >
            </div>
          <button class="btn btn-info" @click="(e) => {e.preventDefault(); sendRegisterForm()}">Register!</button>
        </form>
        </div>
      </div>
    </div>
</template>

<script>
export default {
  data () {
    return {
      registerCredentials: {
        username: '',
        login: '',
        password: ''
      }
    }
  },
  methods: {
    sendRegisterForm: function () {
      alert('Not implemented! Please make roochka.')
    }
  }
}
</script>

<style>

.absolute-center {
  margin: auto;
  position: absolute;
  top: 0; left: 0; bottom: 0; right: 0;
}

.absolute-center.is-responsive {
  width: 50%;
  height: 50%;
  min-width: 200px;
  max-width: 400px;
  padding: 40px;
}

</style>
