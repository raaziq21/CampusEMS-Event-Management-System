/**
 * Alert Service
 * Manages toast alerts across the application with auto-dismiss.
 */
angular.module('emsApp').factory('AlertService', ['$timeout', function ($timeout) {
  var alerts = [];

  function addAlert(type, message, timeout) {
    var id = Date.now() + Math.random();
    var alert = {
      id: id,
      type: type || 'info',
      message: message
    };
    alerts.push(alert);

    // Auto dismiss after specified time (default 5s)
    var duration = (typeof timeout === 'number') ? timeout : 5000;
    if (duration > 0) {
      $timeout(function () {
        removeAlert(id);
      }, duration);
    }
    return id;
  }

  function removeAlert(id) {
    for (var i = 0; i < alerts.length; i++) {
      if (alerts[i].id === id) {
        alerts.splice(i, 1);
        break;
      }
    }
  }

  function clear() {
    alerts.length = 0;
  }

  return {
    getAlerts: function () { return alerts; },
    success: function (msg, time) { return addAlert('success', msg, time); },
    error: function (msg, time) { return addAlert('danger', msg, time); },
    warning: function (msg, time) { return addAlert('warning', msg, time); },
    info: function (msg, time) { return addAlert('info', msg, time); },
    remove: removeAlert,
    clear: clear
  };
}]);
