<style scoped>
.task-wrap {
  position: fixed;
  top: 40px;
  right: 50px;
}

.task-wrap .task-header {
  width: 40px;
  height: 40px;
  line-height: 40px;
  font-size: 12px;
  text-align: center;
  border-radius: 50px;
  background: #1ab394;
  cursor: pointer;
  user-select: none;
}
.task-wrap .task-header .title {
  margin-bottom: 0;
  color: #eee;
  font-weight: bold;
}
.task-wrap .task-header i {
  color: #fff;
}
.task-wrap .task-header .badge-warning {
  color: #fff;
  background: #f8ac59;
  position: absolute;
  top: -5px;
  right: -5px;
}

.task-wrap ul,
.task-wrap ul li {
  margin: 0;
  padding: 0;
  list-style: none;
}

.task-wrap .task-list-wrap {
  position: absolute;
  top: 46px;
  right: 0;
  width: 260px;
  min-height: 60px;
  display: none;
  background: #fff;
  border-radius: 5px;
  border: #e4e4e4 1px solid;
  z-index: 11110;
}
.task-wrap .task-list-wrap .header {
  background: #e2e2e2;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 0;
  line-height: 30px;
  text-indent: 10px;
}
.task-wrap .tasks {
  padding: 7px 5px;
}
.task-wrap .tasks li {
  line-height: 26px;
  position: relative;
  font-size: 12px;
}
.task-wrap .tasks li .task-icon {
  font-size: 14px;
  text-align: left;
  width: 28px;
  display: inline-block;
  text-align: center;
  vertical-align: middle;
  color: #5db2ff;
}
.task-wrap .tasks li .cancel-task {
  top: 7px;
  right: 8px;
  color: #ccc;
  cursor: pointer;
  font-size: 12px;
  display: inline-block;
  position: absolute;
}
.task-wrap .tasks li .cancel-task:hover {
  color: #a94442;
}
</style>

<template>
  <div class="task-wrap" v-if="taskCount">
    <div class="task-header" @click="taskToggle">
      <i v-show="showTasks" class="fa fa-remove"></i>
      <span v-else class="title">任务</span>
      <span class="badge badge-warning">{{ taskCount }}</span>
    </div>

    <div class="task-list-wrap" v-el:task-list-wrap>
      <p class="header">任务列表</p>
      <ul class="tasks">
        <li v-for="task in tasks">
          <i class="fa {{ task.icon }} task-icon"></i>
          {{ task.title }}
          <em v-if="showTaskCancel( task )" class="fa fa-times cancel-task" title="取消任务" @click="cancelTask( task )"></em>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'

export default {
  data () {
    return {
      defaultTask: {
        icon: 'fa-spinner',
        status: 'running',
        title: '',
        taskId: null,
        cancelFn: null
      },
      tasks: [],
      showTasks: false
    }
  },

  computed: {
    taskEl () {
      return $( this.$els.taskListWrap )
    },

    taskCount () {
      return this.tasks.length
    }
  },

  methods: {
    addTask ( task ) {
      let tasks = this.tasks
      let newTask = this.newTask()

      let isString = typeof task === 'string'
      let isObject = Object.prototype.toString.call( task ) === '[object Object]'

      if ( isString ) newTask.title = task
      if ( isObject ) this.flatten( task, newTask )

      if ( isString || isObject ) {
        tasks.push( newTask )
        return newTask.taskId
      }

      console.log( 'Task type is not correct( string, object ), add task failed' )
    },

    updateTask ( task ) {
      let targetTask = this.tasks.filter( item => {
        return item.taskId === task.taskId
      })

      if ( targetTask.length ) {
        this.flatten( task, targetTask[ 0 ] )
      } else {
        console.log( 'No task found' )
      }
    },

    cancelTask ( task ) {
      let vm = this

      vm.$confirm('确定要取消任务吗？', ok => {
        if ( ok ) vm.clearTask( task, task.cancelFn )
      })
    },

    clearTask ( task, cb ) {
      let tasks = this.tasks
      let taskId = typeof task === 'number' ? task : task.taskId

      let delTask = tasks.filter( item => {
        return item.taskId === taskId
      })

      tasks.$remove( delTask[ 0 ] )
      cb && cb()

      if ( !tasks.length ) this.showTasks = false
    },

    flatten ( src, target ) {
      // 传递过来的 taskId 不作覆盖
      Object.keys( src ).forEach( key => {
        if ( target.hasOwnProperty( key ) && key !== 'taskId' ) {
          target[ key ] = src[ key ]
        }
      })
    },

    newTask () {
      const digit = 1000000
      const taskId = this.createRndTaskId( digit )

      return Object.assign( {}, this.defaultTask, { taskId } )
    },

    createRndTaskId ( n ) {
      // 线性同余随机数生成
      const seed = ( new Date().getTime() * 9301 + 49297 ) % 233280
      return Math.ceil( seed / 233280 * n )
    },

    showTaskCancel ( task ) {
      return task.cancelFn && typeof task.cancelFn === 'function'
    },

    taskToggle ( event ) {
      this.showTasks = !this.showTasks

      let taskEl = this.taskEl
      let position = this.getPosition( event )

      if ( this.showTasks ) {
        taskEl.css( position ).show()
      } else {
        taskEl.hide()
      }
    },

    getPosition ( event ) {
      const el = $( event.target ).closest('.task-header')
      const ofs = el.offset()
      const el_w = el.width()
      const el_h = el.height()

      const client = $( document )
      const client_w = client.width()
      const client_h = client.height()

      const taskEl = this.taskEl
      const task_w = taskEl.width()
      const task_h = taskEl.height()

      // 任务列表与按钮的位置偏移量 (算上border宽度)
      const top_diff = 7
      const left_diff = 5

      // 判断 剩余高宽 获得 任务列表 显示的位置
      const position_w = client_w - ofs.left - task_w
      const position_top = ofs.top - task_h
      const position_bottom = client_h - ofs.top - task_h

      let top = 0
      let left = 0

      if ( position_w > 0 ) {
        left = el_w + left_diff
      } else {
        left = - task_w - left_diff * 2
      }

      if ( position_bottom <= 0 && position_top > 0 ) {
        top = el_h - task_h - top_diff
      }

      return { top, left }
    }
  }
}
</script>
