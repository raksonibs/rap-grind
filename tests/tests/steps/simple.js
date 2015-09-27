module.exports = function(){
  this.Given(/^I visit HOMEFILE$/,function(){
    this.driver.get('file:///Users/oskarniburski/Desktop/webdev/chrome_ext/tests/browser_html_test.html')
  });

  this.Then(/^I should see "([^"]*)"$/, function(arg1) {
    return new this.Widgets.TaskList()
  });

  this.When(/^I click "task bind"$/, function(){
    return new this.Widgets.TaskList().addTask()
  });

  // this.Then(/^I should see that the first todo is completed$/, function() {
  //   return new this.Widgets.TodoList()
  //   .isCompleted(0).should.eventually.eql(true)
  // });
}
