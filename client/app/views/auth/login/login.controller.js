angular.module('emsApp').controller('LoginController', [
  '$scope', '$location', 'AuthService', 'AlertService',
  function ($scope, $location, AuthService, AlertService) {
    // If already logged in, redirect to dashboard
    if (AuthService.isAuthenticated()) {
      var user = AuthService.getCurrentUser();
      if (user.role === 'admin') $location.path('/dashboard/admin/overview');
      else if (user.role === 'organizer') $location.path('/dashboard/organizer/overview');
      else $location.path('/dashboard/participant/overview');
      return;
    }

    $scope.credentials = {
      email: '',
      password: ''
    };

    $scope.submitting = false;

    // Quick Fill for Academic Demo / Evaluation
    $scope.quickFill = function (role) {
      if (role === 'admin') {
        $scope.credentials.email = 'admin@ems.edu';
        $scope.credentials.password = 'College@2026';
      } else if (role === 'organizer') {
        $scope.credentials.email = 'organizer@ems.edu';
        $scope.credentials.password = 'College@2026';
      } else if (role === 'participant') {
        $scope.credentials.email = 'participant@ems.edu';
        $scope.credentials.password = 'College@2026';
      }
    };

    $scope.login = function () {
      if (!$scope.credentials.email || !$scope.credentials.password) {
        AlertService.warning('Please enter your email and password.');
        return;
      }

      $scope.submitting = true;
      AuthService.login($scope.credentials)
        .then(function (data) {
          AlertService.success('Welcome back, ' + data.user.name + '!');
          if (data.user.role === 'admin') {
            $location.path('/dashboard/admin/overview');
          } else if (data.user.role === 'organizer') {
            $location.path('/dashboard/organizer/overview');
          } else {
            $location.path('/dashboard/participant/overview');
          }
        })
        .catch(function (err) {
          var msg = (err.data && err.data.message) ? err.data.message : (typeof err === 'string' ? err : 'Login failed. Please verify credentials.');
          AlertService.error(msg);
        })
        .finally(function () {
          $scope.submitting = false;
        });
    };
  }
]);
