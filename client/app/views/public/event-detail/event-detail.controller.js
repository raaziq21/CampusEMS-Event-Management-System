angular.module('emsApp').controller('EventDetailController', [
  '$scope', '$routeParams', '$location', 'EventService', 'RegistrationService', 'AuthService', 'AlertService',
  function ($scope, $routeParams, $location, EventService, RegistrationService, AuthService, AlertService) {
    $scope.loading = true;
    $scope.registering = false;
    $scope.event = null;
    $scope.isRegistered = false;
    $scope.myRegistration = null;

    var eventId = $routeParams.id;

    $scope.isAuthenticated = function () {
      return AuthService.isAuthenticated();
    };

    $scope.getUser = function () {
      return AuthService.getCurrentUser();
    };

    $scope.isParticipant = function () {
      return AuthService.hasRole('participant');
    };

    function loadEvent() {
      $scope.loading = true;
      EventService.getById(eventId)
        .then(function (event) {
          $scope.event = event;
          if (AuthService.isAuthenticated() && AuthService.hasRole('participant')) {
            checkRegistrationStatus();
          }
        })
        .catch(function (err) {
          AlertService.error('Event not found or failed to load.');
          $location.path('/events');
        })
        .finally(function () {
          $scope.loading = false;
        });
    }

    function checkRegistrationStatus() {
      RegistrationService.getMyRegistrations()
        .then(function (regs) {
          if (!regs) return;
          for (var i = 0; i < regs.length; i++) {
            if (regs[i].event && (regs[i].event._id === eventId || regs[i].event === eventId)) {
              if (regs[i].status === 'confirmed') {
                $scope.isRegistered = true;
                $scope.myRegistration = regs[i];
              }
              break;
            }
          }
        })
        .catch(function () {});
    }

    $scope.register = function () {
      if (!AuthService.isAuthenticated()) {
        AlertService.warning('Please log in with your participant account to register for this event.');
        $location.path('/login');
        return;
      }

      if (!AuthService.hasRole('participant')) {
        AlertService.warning('Only participants can register for events. Please use a participant account.');
        return;
      }

      $scope.registering = true;
      RegistrationService.register(eventId)
        .then(function (reg) {
          $scope.isRegistered = true;
          $scope.myRegistration = reg;
          if ($scope.event) {
            $scope.event.registeredCount = ($scope.event.registeredCount || 0) + 1;
          }
          AlertService.success('Congratulations! You have successfully registered for ' + $scope.event.title);
        })
        .catch(function (err) {
          var msg = (err.data && err.data.message) ? err.data.message : 'Registration failed.';
          AlertService.error(msg);
        })
        .finally(function () {
          $scope.registering = false;
        });
    };

    $scope.formatDate = function (dateStr) {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    };

    $scope.formatTime = function (dateStr) {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    loadEvent();
  }
]);
