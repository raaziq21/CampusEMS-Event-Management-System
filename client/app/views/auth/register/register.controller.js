angular.module('emsApp').controller('RegisterController', [
  '$scope', '$location', 'AuthService', 'AlertService',
  function ($scope, $location, AuthService, AlertService) {
    // If already logged in, redirect
    if (AuthService.isAuthenticated()) {
      $location.path('/dashboard/participant/overview');
      return;
    }

    $scope.user = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: ''
    };

    $scope.submitting = false;

    $scope.register = function () {
      if (!$scope.user.name || !$scope.user.email || !$scope.user.password) {
        AlertService.warning('Please fill in all required fields.');
        return;
      }

      if ($scope.user.password.length < 6) {
        AlertService.warning('Password must be at least 6 characters.');
        return;
      }

      if ($scope.user.password !== $scope.user.confirmPassword) {
        AlertService.error('Passwords do not match.');
        return;
      }

      $scope.submitting = true;
      var payload = {
        name: $scope.user.name,
        email: $scope.user.email,
        password: $scope.user.password,
        phone: $scope.user.phone
      };

      AuthService.register(payload)
        .then(function (data) {
          AlertService.success('Registration successful! Welcome to Campus EMS.');
          $location.path('/dashboard/participant/overview');
        })
        .catch(function (err) {
          var msg = (err.data && err.data.message) ? err.data.message : (typeof err === 'string' ? err : 'Registration failed. Email may already be in use.');
          AlertService.error(msg);
        })
        .finally(function () {
          $scope.submitting = false;
        });
    };
  }
]);
