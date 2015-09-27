module.exports = function(){
  this.Widgets = this.Widgets || {};

  this.Widgets.TaskList = this.Widget.List.extend({
    root: ".tasks",

    addTask: function() {
      return this.clickAt({
        selector: "#tasks-bind"
      })
    },

    complete: function (index) {
      return this.clickAt({
        selector: "input",
        index: index
      })
    },


    isCompleted: function(index) {
      return this.at(index).then(function(el){
        return el.hasClass("completed");
      });
    }
  })

  this.Widgets.TodoList = this.Widget.List.extend({
    root: "#todo-list",

    complete: function (index) {
      return this.clickAt({
        selector: "input",
        index: index
      })
    },


    isCompleted: function(index) {
      return this.at(index).then(function(el){
        return el.hasClass("completed");
      });
    }
  })
}