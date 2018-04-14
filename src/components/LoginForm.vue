<template>
  <div class="container">
      <div class="row">
        <div class="absolute-center is-responsive">
          <form>
          <div class="logo-container"></div>
          <div class="form-group">
            <span class="input-group-addon"><i class="glyphicon glyphicon-user"></i></span>
              <input
                type="text"
                class="form-control"
                placeholder="Enter your username"
                v-model="credentials.login"
              >
            </div>
            <div class="form-group">
              <input
                type="password"
                class="form-control"
                placeholder="Enter your password"
                v-model="credentials.password"
              >
            </div>
            <span style="color: red">{{ loginFormError }}</span>
            <div>
              <button class="btn btn-info" @click="(e) => {e.preventDefault(); sendLoginForm()}">Login</button>
            </div>
        </form>
        </div>
      </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'LoginForm',
  data () {
    return {
      loginFormError: '',
      credentials: {
        login: '',
        password: ''
      }
    }
  },
  methods: {
    sendLoginForm: function () {
      axios.post('https://vang.aelnor.info/login', {'login': this.credentials.login, 'password': this.credentials.password}, {withCredentials: true})
        .then((response) => {
          this.$parent.getLoggedUser()
          if (response.data.status === 'Failed') {
            this.loginFormError = response.data.text
          }
        })
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

.logo-container {
  margin: auto;
  margin-bottom: 10px;
  width:150px;
  height:112px;
  background-image:url(../assets/logo.jpg);
  background-size: 150px 112px;
}

</style>
