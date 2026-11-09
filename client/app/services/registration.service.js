/**
 * Registration Service
 * Handles event registrations and cancellation via /api/registrations.
 */
angular.module('emsApp').factory('RegistrationService', ['$http', function ($http) {
  var BASE_URL = '/api/registrations';

  return {
    register: function (eventId) {
      return $http.post(BASE_URL, { eventId: eventId }).then(function (res) {
        return res.data.data.registration;
      });
    },

    cancel: function (registrationId) {
      return $http.put(BASE_URL + '/' + registrationId + '/cancel').then(function (res) {
        return res.data.data.registration;
      });
    },

    getMyRegistrations: function (params) {
      return $http.get(BASE_URL + '/my', { params: params }).then(function (res) {
        return res.data.data.registrations;
      });
    },

    getEventRegistrations: function (eventId, params) {
      return $http.get(BASE_URL + '/event/' + eventId, { params: params }).then(function (res) {
        return res.data.data;
      });
    },

    getAllRegistrations: function (params) {
      return $http.get(BASE_URL, { params: params }).then(function (res) {
        return res.data.data;
      });
    }
  };
}]);
