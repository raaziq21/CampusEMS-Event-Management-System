/**
 * User Service
 * Communicates with backend /api/users endpoints for admin user management and platform statistics.
 */
angular.module('emsApp').factory('UserService', ['$http', function ($http) {
  var BASE_URL = '/api/users';

  return {
    getStats: function () {
      return $http.get(BASE_URL + '/stats/dashboard').then(function (res) {
        return res.data.data;
      });
    },

    getUsers: function (params) {
      return $http.get(BASE_URL, { params: params }).then(function (res) {
        return res.data.data;
      });
    },

    getUserById: function (id) {
      return $http.get(BASE_URL + '/' + id).then(function (res) {
        return res.data.data.user;
      });
    },

    updateRole: function (id, role) {
      return $http.put(BASE_URL + '/' + id + '/role', { role: role }).then(function (res) {
        return res.data.data.user;
      });
    },

    deleteUser: function (id) {
      return $http.delete(BASE_URL + '/' + id).then(function (res) {
        return res.data;
      });
    },

    getOrganizers: function () {
      return $http.get(BASE_URL, { params: { role: 'organizer', limit: 100 } }).then(function (res) {
        return res.data.data.users || [];
      });
    }
  };
}]);
