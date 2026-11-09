/**
 * Event Service
 * Communicates with backend /api/events endpoints.
 */
angular.module('emsApp').factory('EventService', ['$http', function ($http) {
  var BASE_URL = '/api/events';

  return {
    getAll: function (params) {
      return $http.get(BASE_URL, { params: params }).then(function (res) {
        return res.data.data;
      });
    },

    getById: function (id) {
      return $http.get(BASE_URL + '/' + id).then(function (res) {
        return res.data.data.event;
      });
    },

    create: function (eventData) {
      return $http.post(BASE_URL, eventData).then(function (res) {
        return res.data.data.event;
      });
    },

    update: function (id, eventData) {
      return $http.put(BASE_URL + '/' + id, eventData).then(function (res) {
        return res.data.data.event;
      });
    },

    delete: function (id) {
      return $http.delete(BASE_URL + '/' + id).then(function (res) {
        return res.data;
      });
    },

    assignOrganizer: function (id, organizerId) {
      return $http.put(BASE_URL + '/' + id + '/assign', { organizerId: organizerId }).then(function (res) {
        return res.data.data.event;
      });
    }
  };
}]);
