//return array of timeperiods in the form {from:int,till:int}
var getTimePeriods = function (from, till, step) {
    var timePeriods = [],
        timeStep = getTimeStep(step);
    while (from < till) {
        var temp = till;
        till = till - timeStep;
        if (till > from) {
            timePeriods.push({from: till, till: temp});
        } else {
            timePeriods.push({from: from, till: temp});
        }
    }
    return timePeriods;
};

//get step in mili sec
var getTimeStep = function (step) {
    var timeStep = 86400000; // a day in mili sec = 1000*60*60*24
    if (step == 'w') {
        timeStep = timeStep * 7;
    }
    if (step == 'm') {
        timeStep = timeStep * 30;
    }
    return timeStep;
};

//return array of timeperiods in the form {from:int,till:int}
var getDates = function (from, till) {
    var timePeriods = [],
        dayStep =  86400000;
    while (from < till) {
        if (till > from) {
            timePeriods.push(getDate(till));
        } else {
            timePeriods.push(getDate(from));
        }
        till = till - dayStep;
    }
    return timePeriods;
};


//get Date from time stamp
var getDate = function (timeStamp) {
    if(!timeStamp) timeStamp = Date.now();
    var date = new Date(parseInt(timeStamp));
    var day = date.getDate(),
        month = date.getMonth() + 1,
        year = date.getYear() - 100;  //fix problem with get year return 113 instead of 13
    day = day < 10 ? "0" + day : day;
    month = month < 10 ? "0" + month : month;
    return month + "/" + day + "/" +year;
}

exports.getDates = getDates;
exports.getDate = getDate;