describe("Leading Zero Creator and minus one for month as zero indexed", function() {
  it("creates a value with a leading zero for single digit month", function() {
    expect(leadingZeroCreator(moment('2012-01-12'), 'month')).toEqual("00");
  });

  it("does not create a value with a leading zero for double digit month", function() {
    expect(leadingZeroCreator(moment('2012-12-12'), 'month')).toEqual("11");
  });

  it("creates a value with a leading zero for single digit day", function() {
    expect(leadingZeroCreator(moment('2012-12-03'), 'day')).toEqual("03");
  });

  it("does not create a value with a leading zero for a double digit day", function() {
    expect(leadingZeroCreator(moment('2012-12-12'), 'day')).toEqual("12");
  });
});

describe('Creating a new FireBase Instance', function() {

  var today = new Date(),
      userId,
      userCookie,
      snap,
      f;

  beforeEach(function() {
    var dd = today.getDate();
    var mm = today.getMonth(); 
    var yyyy = today.getFullYear();

    if(dd<10){
        dd='0'+dd
    }

    if(mm<10){
        mm='0'+mm
    } 

    todayAns = dd+','+mm+','+yyyy;
    userId = Math.ceil((Math.random()*10000)).toString()
    userCookie = userId

    it('should assign a user a unique cookie', function() {
      expect(userCookie).toEqual(userId)
    })
    
    var userCookie = '297'
    f = new Firebase('https://dazzling-inferno-7266.firebaseio.com/'+userCookie+'/days');
    f.on('value', function(snapshot) {
      init(snapshot)
    })
  })


  it('should create a new firebase instance', function() {
    expect(typeof f).toEqual('object')
  })

  it('should return empty array wih zero goals', function() {
    expect(getGoals(todayFB)).toEqual([])
  })

})