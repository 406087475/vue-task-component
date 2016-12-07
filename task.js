import Vue from 'vue'
import task from 'src/components/task/task'

exports.install = () => {
  const div = document.createElement( 'div' )
  div.innerHTML = `<task></task>`
  document.body.appendChild( div )

  const taskInstance = new Vue({
    el: div,
    components: { task }
  }).$children[ 0 ]

  Vue.prototype.$addTask = taskInstance.addTask
  Vue.prototype.$clearTask = taskInstance.clearTask
  Vue.prototype.$updateTask = taskInstance.updateTask
}