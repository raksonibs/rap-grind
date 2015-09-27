if ($.cookie('userId') === undefined) {
  var userId = Math.ceil((Math.random()*10000)).toString()
  $.cookie('userId', userId, { expires: 730 });
} 

if ($.cookie('priority') === undefined) {
  $.cookie('priority', 0)
}

var userCookie = $.cookie('userId')

if (userCookie == undefined) {
  userCookie = 297
}

var f = new Firebase('https://dazzling-inferno-7266.firebaseio.com/'+userCookie+'/days');

var today = new Date();
var dd = today.getDate();
var mm = today.getMonth(); 
var goalHtml;
var todayFB;
var setFbData;
var lastItem;

var yyyy = today.getFullYear();

if(dd<10){
    dd='0'+dd
}

if(mm<10){
    mm='0'+mm
} 

var todayAns = dd+','+mm+','+yyyy;
var inputFBData;
var count = 0;
var completeChange;

var getGoals = function(todayFB) {
  var arrObj = []
  for(var k in todayFB.goals) {
    var particularGoal = todayFB.goals[k]
    // only get noncompleted goals. If the goal is completed, but tasks still have that, then goal cannot be completed
    // if all tasks are completed, then goal gets completed, but should stil be able to add to uncompleted goals for that day,
    // because that makes goal then go from completed to uncompleted.
    if (particularGoal.completed === false) {        
      arrObj.push([k, [particularGoal.color, particularGoal.goalDetails, particularGoal.goal]]);
    }
  }

  return arrObj
}

var getRandomColor = function() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

var leadingZeroCreator = function(val, type) {
  var leadingZero = '0'
  if ( type === 'month' ){
    if (val.month().toString().length < 2 ) {
      leadingZero += val.month().toString()
    } else {
      leadingZero = val.month().toString()
    }
  } else {
    if (val.date().toString().length < 2 ) {
      leadingZero += val.date().toString()
    } else {
      leadingZero = val.date().toString()
    }
  }

  return leadingZero
}

var setTodayFB = function(snapshot) {
  if ( snapshot.val() !== null ) {
    todayFB = snapshot.val()[todayAns];
  } else {
    todayFB = undefined
  }
}

var init = function(snapshot) {
  setTodayFB(snapshot)

  var checkHistory = function() {
    var daysSince = []
    var dayCount = -1
    var completeTasks = []

    while ( dayCount <= 5 ) {
      dayCount += 1
      var momentDay = moment().subtract(dayCount,'d')
      var momentString = leadingZeroCreator(momentDay, 'day')+','+leadingZeroCreator(momentDay, 'month')+','+momentDay.year()
      daysSince.push(momentString)
    }
    
    for (var i in daysSince) {            
      var todayEval = snapshot.val()[daysSince[i]]
      if ( todayEval !== undefined ) {
        if (todayEval.tasks !== "") {
          for (var key in todayEval.tasks) {
            if (completeTasks[i] === undefined) {
              completeTasks.push({ name: daysSince[i], value: 0 })
            }
            if (todayEval.tasks[key].completed === true) {
              completeTasks[i].value = completeTasks[i].value + 1
            }
          } 
        } else {
          completeTasks.push({ name: daysSince[i], value: 0 })
        }
      } else {
        completeTasks.push({ name: daysSince[i], value: 0 })
      }
    }

    var drawCompleted = function(data) {
      var margin = {top: 20, right: 30, bottom: 30, left: 40},
      width = 625 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

      var x = d3.scale.ordinal()
          .rangeRoundBands([0, width], .1);

      var y = d3.scale.linear()
          .range([height, 0]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left");

      var chart = d3.select(".chart")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        x.domain(data.map(function(d) { return d.name; }));
        y.domain([0, d3.max(data, function(d) { return d.value; })]);

        chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        chart.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        chart.selectAll(".bar")
            .data(data)
          .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.name); })
            .attr("y", function(d) { return y(d.value); })
            .attr("height", function(d) { return height - y(d.value); })
            .attr("width", x.rangeBand());
    }

    drawCompleted(completeTasks)

  }

  $('.stats').click(function() {
    checkHistory()
  })

  var transferAllData = function(snapshot) {
    var nextDay = moment().add(1, 'd')
    var monthZero = leadingZeroCreator(nextDay, 'month')
    var dayZero = leadingZeroCreator(nextDay, 'day')
    var strNxt = dayZero+','+monthZero+','+nextDay.year()
    var nextDayRef = f.child(strNxt);

    var nonCompletedThings = function(klass) {
      var todayVal = snapshot.val()[todayAns]
      var nonCompleteItems = {}
      for (var item in todayVal[klass]) {
        var particularItem = todayVal[klass][item]
        if (particularItem['completed'] === false) {
          var select;
          if (klass === 'goals') {
            select = 'goal'
          } else {
            select = 'task'
          }

          if (select === 'goal') {
            nonCompleteItems[item] = {
                                      goalDetails: particularItem['goalDetails'],
                                      completed: particularItem['completed'],
                                      createdAt: particularItem['createdAt'],
                                      color: particularItem['color']
                                     }
          } else {
            goals = particularItem['goals'] === undefined ? [] : particularItem['goals']
            nonCompleteItems[item] = {
                                      completed: particularItem['completed'],
                                      createdAt: particularItem['createdAt'],
                                      goals: goals
                                     }
          }

          nonCompleteItems[item][select] = particularItem[select]

        } else {
          todayRef.child(klass).child(item).update({
            completedOn: moment().format('DD MMMM YYYY')
          })
        }
      }
      return nonCompleteItems
    }

    var notCompleteGoals = nonCompletedThings('goals');
    var notCompleteTasks = nonCompletedThings('tasks');

    nextDayRef.set({
      goals: notCompleteGoals,
      thoughts: '',
      tasks: notCompleteTasks
    });
  }

  setFbData = function(todayFB, string) {
    try {
      var itemCount = 0;
      var fadeNew= ''
      var lastTrack;
      if ( todayFB[string] === undefined ) {
        lastTrack = 0
      } else {
        lastTrack = Object.keys(todayFB[string]).length
      }
      var returnString = '<ul class="sortable '+string+'">'
      var positionCount = 0;

      for (var key in todayFB[string]) {
        var item = todayFB[string][key];
        itemCount += 1;

        // if ( itemCount === lastTrack ) {
        //   fadeNew = 'fadein'
        // }

        for ( var prop in item ) {
          if ( item.hasOwnProperty(prop) && item[prop] !== true && item[prop] !== false && prop !== 'createdAt' && prop !== 'completedOn' && 'priority' !== prop && 'goalDetails' !== prop && 'color' !== prop && (prop ==='goal' || prop === 'task') ){
            var replacedDate = item.createdAt.replace(/,/g,'-')
            var createdAt = moment(replacedDate,'DD-MM-YYYY')
            createdAt = moment(createdAt).add(1,'months').fromNow()
            
            if ( createdAt.match(/second/) || createdAt.match(/hour/) || createdAt.match(/minute/) ) {
              createdAt = "Today!"
            } 

            returnString += '<li class="editable '+fadeNew+'" data-completed='+item.completed+' data-class="'+string+'"id="'+key.toString()+'" data-position="'+positionCount+'">' 
            +'<span class="list-text">'+item[prop]+'</span>'
            +'<span class="delete-icon glyphicon glyphicon-trash"></span>'
            +'<span class="edit-icon glyphicon glyphicon-pencil"></span>'
            if (string === "goals") {
              returnString += '<span class="show-icon glyphicon glyphicon-eye-open"></span>'
                              +'<p class="hidden-details"><br>'+item.goalDetails+'</p>'
                              +'<p class="hidden-color"><br>'+item.color+'</p>'
            }
            if (string === "tasks") {
              var goalsAttached = item.goals 
              if (goalsAttached !== undefined) {                
                returnString += '<span class="hidden-goals"><br>'+item.goals+'</span>'                                
              }
              returnString += '<span class="show-icon-goals glyphicon glyphicon-eye-open"></span>'
            }
            returnString += '<br /><span class="small-hide">Created '
            +createdAt
            +'</span>'
            +'</li>'
            positionCount += 1
          }
        }
      }

      transferAllData(snapshot)

      returnString += '</ul>'
      return returnString

    } catch (e) {
      return "Add some items!"
    }
  }

completeChange = function(thisComplete, zen) {
    if ( zen === false ) {
      var thisParent = $(thisComplete).parent()
    } else  {
      var thisParent = $(thisComplete)
    }

    var completeFlip;
    var localName = $(thisParent).attr('data-class').replace(new RegExp('s$'), '')
    var fbId = $(thisParent).attr('id')
    var fbClass = $(thisParent).attr('data-class')
    var completedVal = snapshot.val()[todayAns][fbClass][fbId].completed

    if (completedVal) {
      completeFlip = false
    } else {
      completeFlip = true
    }

    var completeRef = new Firebase('https://dazzling-inferno-7266.firebaseio.com/'+userCookie+'/days/'+todayAns+'/'+fbClass+'/'+fbId)
    
    completeRef.update({
      completed: completeFlip
    })

    if ( zen == true ) {
      $('.modal-body li#'+thisParent.attr('id')).hide();
      var posNum = parseInt(thisParent.attr('data-position'))+1
      $('.modal-body li[data-position="'+posNum+'"').css('display', 'block')
    }
  }

  $('.zen-mode').unbind().click(function() {
    var zenWhich = $(this).text().toLowerCase()
    todayFB = snapshot.val()[todayAns];
    $('#zenModalLabel').text('Zen Mode - '+$(this).text())
    // need to check for when undefined as function callback
    if ( zenWhich === "tasks" || zenWhich === "goals") {

      var listZen = setFbData(todayFB, zenWhich)
      $('#zenModal').find('#zen-thoughts-bind').hide()
      $('#zenModal').find('.modal-body').html(listZen)
      var nonCompleteListZen = '<ul>'

      $('.modal-body li').each(function(index, element) {
        var thisElement = $(element)
        if ( thisElement.attr('data-completed') === 'false' ) {
          nonCompleteListZen += '<li class="editable" data-completed='+thisElement.attr('data-completed')+' data-class="'+thisElement.attr('data-class')+'"id="'+thisElement.attr('id')+'" data-position="'+thisElement.attr('data-position')+'">' 
          +thisElement.find('.list-text')[0].outerHTML
          +'</br>'
          +thisElement.find('.small-hide')[0].outerHTML
          +'</li>'
        }   
      })

      nonCompleteListZen += "</ul>"

      if ( nonCompleteListZen.length >= 10 ) {   
        $('#zenModal').find('.modal-body').html(nonCompleteListZen)
      } else {
        $('#zenModal').find('.modal-body').html('<p>Add some '+zenWhich+' to fully zen!</p>')
      }

    } else {
      $('#zenModal').find('.modal-body').html('')
      $('#zenModal').find('#zen-thoughts-bind').show()
      $('#zenModal').find('.modal-body').html('<textarea id="thoughts-bind" class="bind zen-thoughts-bind" name="textarea">'+todayFB.thoughts+'</textarea>')
      $('#zenModal').find('.modal-body').find('.zen-thoughts-bind').css('text-align', 'left')
    }
  })

  var todayRef = f.child(todayAns);
  var fromTime = moment().endOf('day').fromNow(true)
  var reg = /second/

  if ( fromTime.match(reg) ) {
    transferAllData(snapshot)
  }

  inputFBData = function(thisInput) {
    var todayRef = f.child(todayAns);
    var priortyNum = parseInt($.cookie('priority'))

    if ($(thisInput).val() !== "" || $(thisInput).siblings()[0] !== "") {             
      var valId = $(thisInput).attr('id')

      if (valId === "goals-bind" || valId === "goals-submit-edit") {
        if (valId === "goals-submit-edit") {
          var goalName = $($(thisInput).siblings()[0]).val()
          var goalDetails = $(thisInput).siblings()[1]
          var currentLiUrl = $($(thisInput).parent()).attr('id')
        } else {          
          var goalName = $(thisInput).val() === "" ? $($('.goals').find('#goals-bind')).val() : $(thisInput).val()
          var goalDetails = $(thisInput).siblings()[0]
          var currentLiUrl = $(thisInput).attr('data-fburl')
        }

        if (currentLiUrl) {
          var specificGoal = todayRef.child('goals').child(currentLiUrl).update({
            goal: goalName,
            goalDetails: $(goalDetails).val()
          })
        } else {
          var goalsRef = todayRef.child('goals').push()

          if (typeof goalName === 'string') {
            goalsRef.setWithPriority({
              goal: goalName,
              goalDetails: $(goalDetails).val(),
              completed: false,
              createdAt: todayAns,
              color: getRandomColor()
            }, priortyNum)
          }
          $('.goal-add-show').html('')
          $('#goals-bind').val('')
        }
      } else if (valId === "tasks-bind" || $(thisInput).attr('class') === "task-goal-add") {
        if ($(thisInput).attr('class') === "task-goal-add") {
          var goalList = $(thisInput).siblings().find('input:checked')
          var goalIds = []
          for  (var i=0; i<goalList.length; i++)  {
            goalIds.push($(goalList[i]).attr('id'))
          }
          if ($(thisInput).attr('data-function') === "edit") {
            thisInput = $(thisInput).parent().children()[0]
          } else {
            thisInput = $(thisInput).parent().parent().siblings()[1]
          }
        }        

        if ($(thisInput).attr('data-fburl')) {
          var specificTask = todayRef.child('tasks').child($(thisInput).attr('data-fburl')).update({
            task: $(thisInput).val(),
            goals: goalIds
          })
        } else {
          if ( snapshot.val()[todayAns]['tasks'] === undefined || snapshot.val()[todayAns]['tasks'] === "" || Object.keys(snapshot.val()[todayAns]['tasks']).length <= 25 ) {
            var tasksRef = todayRef.child('tasks').push()            
            if (typeof $(thisInput).val() === 'string') {
              tasksRef.setWithPriority({
                task: $(thisInput).val(),
                completed: false,
                createdAt: todayAns,
                goals: goalIds
              }, priortyNum)
            }
            $(thisInput).val('') 
            $('.target-display').css('display', 'none')
          } else {
            $(thisInput).val("Sorry can't make more than twenty-five tasks per day! Prioritize!")
          }
        } 
      } else {
        if (valId !== 'goals-details') {
          f.child(todayAns).update({
            thoughts: $(thisInput).val(),
          });          
        }
      }

      var updateCookie = parseInt($.cookie('priority')) + 1
      $.cookie('priority', updateCookie)
    }

    transferAllData(snapshot)
  }
  
  if ( todayFB === undefined ) {
    todayRef.set({
      goals: "",
      thoughts: "",
      tasks: ""
    });
  } else {

    goalsString = setFbData(todayFB, 'goals')
    tasksString = setFbData(todayFB, 'tasks')

    $('.goal-list').html(goalsString)
    $('.task-list').html(tasksString)
    $('#thoughts-bind').val(todayFB.thoughts) 

    $('.sortable').sortable({
      change: function(event, ui) {
        var resortList = function(thisItem, movement) {
          var itemId = ui.item.context.id
          var currentLi = $('#'+itemId)
          var posVal = movement === 'up' ? 1 : -1
          var pos = parseInt($(currentLi).attr('data-position')) + posVal
          var newTopItem =  $('li[data-class="'+$(currentLi).attr('data-class')+'"][data-position="'+pos+'"]')
          var klass = $(thisItem).hasClass('goals') === true ? 'goals' : 'tasks'
          var newTopItemChild = todayRef.child(klass).child(newTopItem.attr('id'))
          newTopItemChild.on('value', function(snap) {
            var newTopItemChildPriority = snap.getPriority()
            var specificItemChild = todayRef.child(klass).child(itemId)
            specificItemChild.on('value', function(specSnap) {
              var specificItemChildPriority = specSnap.getPriority()
              newTopItemChild.setPriority(specificItemChildPriority)
              specificItemChild.setPriority(newTopItemChildPriority)
            })
          })
        }

        if (ui.originalPosition.top < ui.position.top) {
          resortList(this, 'up')
        } else {
          resortList(this, 'down')
        }
      }
    });         
}

  $('#day').text(todayAns)

  $('.edit-icon').on('click',function(e) {
    var thisParent = $(this).parent()
    // ntd: reset all other inputs so not multiple edits
    lastItem = thisParent[0].outerHTML
    var thisVal = thisParent.find('.list-text').text()
    var categoryBind = thisParent.attr('data-class')
    if (categoryBind === 'goals') {
      var thisDetails = thisParent.find('.hidden-details').text()
      thisParent.html('<input id="'+categoryBind+'-bind" class="bind" type="text" data-fburl="'+thisParent.attr('id')+'" value="'+thisVal+'"></input>'
                      + '<textarea class="bind" id="goals-details" name="textarea" rows="3" cols="30" placeholder="Goal Details (optional)">'+thisDetails+'</textarea>'
                      + "<button type='submit' id='goals-submit-edit' class='submit-button-goal'>Submit</button>")
    } else {
      var selectedGoals = $(thisParent).find('.hidden-goals').text().split(',')
      thisParent.html('<input id="'+categoryBind+'-bind" class="bind" type="text" data-fburl="'+thisParent.attr('id')+'" value="'+thisVal+'"></input>'
                      +goalHtml(selectedGoals))
      $.each($('.goal-listed'), function(index, value) {
        $(this).css('background-color', $(this).attr('data-color'))
      })
    }
    e.preventDefault()
    e.stopPropagation()
  }).children().click(function(e) {    
    return false;
  });

  $('.content-box .list-text').unbind().click(function(e) {
    if (e.target !== this) return;
    completeChange(this, false)
    transferAllData(snapshot)
  })

  $('.delete-icon').on('click', function(e) {
    var todayRef = f.child(todayAns);
    $(this).parent().addClass('fadeout')
    var category = $(this).parent().attr('data-class')
    var fbUrl = $(this).parent().attr('id')
    todayRef.child(category).child(fbUrl).remove()
    e.preventDefault()
    transferAllData(snapshot)
  })

  var resetFunction = function() {
    $('.target-display').html('')
    goalsString = setFbData(todayFB, 'goals')
    tasksString = setFbData(todayFB, 'tasks')

    $('.goal-list').html(goalsString)
    $('.task-list').html(tasksString)
  }

  $('.show-icon').on('click', function(e) {
    // resetFunction()
    var colorBack = $(this).siblings().closest('.hidden-color').text()
    var parent = $(this).parent()
    var parentId = $(parent).attr('id')
    if (parent.css('background-color') === 'rgba(0, 0, 0, 0)') {
      parent.css('background-color', colorBack)
      $.each($('li[data-class="tasks"]'), function(index, value) {
        var goalListIds = $(value).find('.hidden-goals').text().split(',')
        if ($.inArray(parentId,goalListIds) !== -1) {
          $(value).css('background-color', colorBack)
        } 
      })
    } else {
      parent.css('background-color', 'rgba(0, 0, 0, 0)')
      $.each($('li[data-class="tasks"]'), function(index, value) {
        $(value).css('background-color', 'rgba(0, 0, 0, 0)')
      })
    }
  })

  $('.show-icon-goals').on('click', function(e) {
    var parent = $(this).parent()
    var goalListIds = $(parent).find('.hidden-goals').text().split(',')
    if (parent.css('border') === '2px dashed rgb(73, 72, 107)') {
      parent.css('border', 'none')
      $.each(goalListIds, function(index, value) {
        $('li#'+value+'').css('border', 'none')
      })
    } else {
      parent.css('border', '2px dashed #49486B')
      $.each(goalListIds, function(index, value) {
        $('li#'+value+'').css('border', '2px dashed #49486B')
      })
    }
  })

  $('.next-day, .previous-day').unbind().click(function() {
    var dayApproaching;
    var $this = $(this)

    if ( $this.hasClass('next-day') ) {
      count = count + 1
      iterateNum = Math.abs(count)
      if ( count < 0 ) {
        dayApproaching = moment().subtract(iterateNum,'d')
      } else if ( count >= 0) {
        dayApproaching = moment().add(iterateNum,'d')
      } 
    } else {
      count = count - 1
      iterateNum = Math.abs(count)
      if ( count > 0 ) {
        dayApproaching = moment().add(iterateNum,'d')
      } else if ( count <= 0) {
        dayApproaching = moment().subtract(iterateNum,'d')
      } 
    }

    var monthZero = leadingZeroCreator(dayApproaching, 'month')
    var dayZero = leadingZeroCreator(dayApproaching, 'day')

    dayApproaching = dayZero+','+monthZero+','+dayApproaching.year()

    var dayApproachingRefLink = new Firebase('https://dazzling-inferno-7266.firebaseio.com/days/'+dayApproaching)
    todayAns = dayApproaching 
    $('#day').text(todayAns)

    todayFB = snapshot.val()[todayAns];

    goalsString = setFbData(todayFB, 'goals')
    tasksString = setFbData(todayFB, 'tasks')

    if (goalsString !== 'Add More Items' && tasksString !== 'Add More Items') {
      $('.goal-list').html(goalsString)
      $('.task-list').html(tasksString)
      $('#thoughts-bind').val(todayFB.thoughts)
    } else {
      $('#day').text("That day doesn't exist for you yet")
      $('.goal-list').html('')
      $('.task-list').html('')
      $('#thoughts-bind').val('')
    }

    if ( leadingZeroCreator(moment(), 'day') !== todayAns.slice(0,2) ) {
      $('.list-text').off('click')
    } else {
      $('.list-text').on('click',function(e) {
        if (e.target !== this) return;
        completeChange(this, false)
        transferAllData(snapshot)
      }).children().click(function(e) {
        return false;
      });
    }
  })

  goalHtml = function(selectedGoals) {
    selectedGoals = typeof selectedGoals !== 'undefined' ? selectedGoals : false;
    var goalsList = '<div class="target-display"> <h6> Possible Goal Categories </h6>'
    $.each(getGoals(todayFB), function(index, value) {
      goalsList += '<div class="goal-listed" data-color='+value[1][0]+'>' 
      +'<input type="checkbox" id='+value[0]
      if (selectedGoals) {
        if ($.inArray(value[0],selectedGoals) !== -1) {          
          goalsList += ' checked>'+value[1][2]+'</input></div>'
        } else {
          goalsList += '>'+value[1][2]+'</input></div>'
        }
      } else {
       goalsList += '>'+value[1][2]+'</input></div>'
      }
    })

    if (selectedGoals) {
      goalsList += '<button type="submit" class="task-goal-add" data-function="edit">Add Task </button>'
    } else {      
      goalsList += '<button type="submit" class="task-goal-add">Add Task </button>'
    }

    goalsList += '<div id="cancel-task" class="cancel glyphicon glyphicon-remove"></div></div>'

    $.each($('.goal-listed'), function(index, value) {
      $(this).css('background-color', $(this).attr('data-color'))
    }) 

    return goalsList   
  }

}

f.on('value', function(snapshot) {
  init(snapshot)
})


$(document).on('click', '.modal-body .editable', function() {
  completeChange(this,true)
})

$(document).on('click', '.clear-everything', function() {
  f.remove()
})

$(document).on('click', '.goal-add', function() {
  $('.goal-add-show').html('<textarea class="bind" id="goals-details" name="textarea" rows="3" cols="30" placeholder="Goal Details (optional)"></textarea>'
    + "<button type='submit' id='goals-bind' class='submit-button-goal'>Submit</button>"
    + '<button id="cancel-goal" class="cancel glyphicon glyphicon-remove"></button>')
  // ntd: how to select goal of add?
})

$(document).on('click', '.task-add', function() {
  $('.goal-list-for-task').html(goalHtml())

  $.each($('.goal-listed'), function(index, value) {
    $(this).css('background-color', $(this).attr('data-color'))
  })

})

$(document).on('click', '.cancel', function() {
  $('.target-display').html('')
  if ($(this).attr('id') === "cancel-task") {  
    $('.task-list').find('input').parent().html(lastItem)
  } else {
    var goalInput = $($('.goal-list').find('input'))
     $('.goal-list').find('input').parent().html(lastItem)
  }
})

$(document).on('click', '.submit-button-goal, .task-goal-add', function() {
  inputFBData(this)
})

$(document).on('keyup', '.bind', function(e) {
  var code = e.keyCode || e.which;

  if(code == 13) {
    inputFBData(this)
  }
})