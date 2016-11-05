import moment from 'moment';
import _ from 'underscore';

export const getEorzeaTime = () => {
  const eorzeaMultipler = (3600 / 175) * 1000;
  const universalTime = moment().unix();

  return universalTime * eorzeaMultipler;
}

export const setTime = () => {
  var eorzeaTime = getEorzeaTime(),
      result = moment.utc(eorzeaTime);

    return {
        'time': result.format('h:mm A'),
        'meridiem': result.format('A'),
        'hour': parseFloat(result.format('H')),
        'minute': parseFloat(result.format('m'))
    };
};

export const getEarthDurationfromEorzean = (stringDuration) => {
    // 175 earth seconds = 3600 eorzean seconds (1 hour)
    var time = {
            hours: parseFloat(stringDuration.split(':')[0]),
            minutes: parseFloat(stringDuration.split(':')[1])
        },
        totalMins = (time.hours * 60) + time.minutes,
        totalSeconds = totalMins * 60;

    // how many multiples of 175 (eorz hours) we have.
    var earthUnits = totalSeconds / 3600;

    var totalEarthSeconds = earthUnits * 175,
        minutes = Math.floor(totalEarthSeconds / 60),
        hours = Math.floor(minutes / 60),
        seconds = Math.ceil(((totalEarthSeconds / 60) - minutes) * 60);

    if (minutes > 60) {
        var diff = Math.floor(minutes / 60);
        minutes = minutes - (diff * 60);
    }

    return {
        hours: hours,
        minutes: minutes,
        seconds: seconds
    };
};

/**
 *   Expects two string times with meridien,
 *   IE: 8:00 AM, 7:00 PM
 *   B will be compared against A, like in subtraction.
 *   ex1: A: 12:00 AM B: 11:00 PM = 23 hour difference.
 *   ex2: A: 11:00 PM B: 12:00 AM = 1 hour difference.
 */
export const getTimeDifference = (a, b) => {
    let hours = 0,
        minutes = 0,
        times = {};

    _.each([a, b], function(time, idx) {
        times[idx] = getTimeObjFromString(time);
    });

    let timeA, timeB, diff;

    timeA = (times[0].hour * 60) + times[0].minute;
    timeB = (times[1].hour * 60) + times[1].minute;

    diff = timeB - timeA;

    hours = Math.floor(diff / 60);
    minutes = diff - (hours * 60);

    if(hours < 0) {
        hours = hours + 24;
    }

    return {
        hours: hours,
        minutes: minutes
    };
};

// Expects a string format: 12:00 AM
export const getTimeRemaining = (nodeTime, duration, currTime) => {
    let endTime = getEndTimeFromDuration(nodeTime, duration);

    return getTimeDifference(currTime, endTime);
}

// Expects a string format: 12:00 AM
// Best used for active nodes.
export const getEarthTimeRemaining = (nodeTime, duration, currTime) => {
    let endTime = getEndTimeFromDuration(nodeTime, duration),
        diff = getTimeDifference(currTime, endTime),
        durStr = getDurationStringFromObject(diff);

    return getEarthDurationfromEorzean(durStr);
}

export const getTimeUntil = (nodeTime, currTime) => {
  return getTimeDifference(currTime, nodeTime)
}

// Expects string formats: 12:00 AM
// Best used for inactive (upcoming) nodes
export const getEarthTimeUntil = (nodeTime, currTime) => {
  let startUntil = getTimeDifference(currTime, nodeTime)
      durStr = getDurationStringFromObject(startUntil);

  return getEarthDurationfromEorzean(durStr)
}

// Expects format: 12:00 AM
export const getTimeObjFromString = (stringTime) => {
    let time = stringTime,
        isAM = time.indexOf('AM') > -1,
        hour = parseFloat(time.split(' ')[0].split(':')[0]);

    if (isAM && hour === 12) {
        hour = 0;
    } else if (!isAM && hour !== 12) {
        hour += 12;
    }

    return {
        hour: hour,
        minute: parseFloat(time.split(' ')[0].split(':')[1])
    };
};

// Expect object formatted from getTimeObjFromString
export const getTimeStringFromObject = (timeObj) => {
    let hour = timeObj.hour,
        minute = timeObj.minute,
        meridien = 'AM';

    if (hour > 12) {
        meridien = 'PM';
        hour = hour - 12;
    } else if(hour === 12) {
        meridien = 'PM';
    }

    minute = minute < 10 ? '0' + minute : minute;

    return hour + ':' + minute + ' ' + meridien;
};

export const getTimeStringFromDuration = (stringStartTime, stringDuration) => {
    let startTime = getTimeObjFromString(stringStartTime),
        duration = {
            hour: parseFloat(stringDuration.split(':')[0]),
            minute: parseFloat(stringDuration.split(':')[1])
        },
        end = {};

    let hour = startTime.hour + duration.hour,
        minute = startTime.minute + duration.minute;

    if (minute > 60) {
        hour++;
        minute -= 60;
    }

    if (hour > 24) {
        hour -= 24;
    }

    if (hour > 12) {
        hour -= 12;
        end.meridien = 'PM';
    } else {
        end.meridien = 'AM';
    }

    end.hour = hour;
    end.minute = minute < 10 ? '0' + minute : minute;

    return end.hour + ':' + end.minute + ' ' + end.meridien;
};

export const getDurationObjFromString = (duration) => {
    let hours = parseFloat(duration.split(':')[0]),
        mins = parseFloat(duration.split(':')[1]);

    return {
        hours: hours,
        minutes: mins
    };
};

export const getDurationStringFromObject = (durationObj) => {
    let hours = durationObj.hours,
        mins = durationObj.minutes;

    if(mins < 10) {
        mins = '0' + mins.toString()
    }

    return hours + ':' + mins;
};

export const getEndTimeFromDuration = (startTime, duration) => {
    let startObj = getTimeObjFromString(startTime),
        durationObj = getDurationObjFromString(duration),
        endObj = {
            hour: startObj.hour + durationObj.hours,
            minute: startObj.minute + durationObj.minutes
        };

    if(endObj.minute >= 60) {
        endObj.hour += 1;
        endObj.minute -= 60;
    }

    if(endObj.hour >= 24) {
        endObj.hour -= 24;
    }

    return getTimeStringFromObject(endObj);
};

export const isActive = (currentTime, startTime, duration) => {
    let endTime = getEndTimeFromDuration(startTime, duration),
        startTimeDiff = getTimeDifference(currentTime, startTime),
        endTimeDiff = getTimeDifference(currentTime, endTime),
        durationObj = getDurationObjFromString(duration),
        result = false;

    let startTimeDiffMins = (startTimeDiff.hours * 60) + startTimeDiff.minutes,
        endTimeDiffMins = (endTimeDiff.hours * 60) + endTimeDiff.minutes,
        durationMins = (durationObj.hours * 60) + durationObj.minutes;

    if(endTimeDiffMins < durationMins) {
        result = true;
    }

    return result;
};
