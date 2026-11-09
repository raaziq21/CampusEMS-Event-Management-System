angular.module('emsApp').controller('ParticipantOverviewController', [
  '$scope', 'RegistrationService', 'AuthService', 'AlertService',
  function ($scope, RegistrationService, AuthService, AlertService) {
    $scope.loading = true;
    $scope.cancellingId = null;
    $scope.user = AuthService.getCurrentUser();
    $scope.registrations = [];

    // Filter controls
    $scope.searchQuery = '';
    $scope.statusFilter = '';

    // Summary stats
    $scope.stats = {
      total: 0,
      upcoming: 0,
      cancelled: 0,
      completed: 0
    };

    // Modal state for confirmation
    $scope.cancelModal = {
      show: false,
      reg: null
    };

    $scope.loadRegistrations = function () {
      $scope.loading = true;
      RegistrationService.getMyRegistrations()
        .then(function (regs) {
          $scope.registrations = regs || [];
          calculateStats();
        })
        .catch(function (err) {
          var msg = (err.data && err.data.message) ? err.data.message : 'Failed to load your registrations.';
          AlertService.error(msg);
        })
        .finally(function () {
          $scope.loading = false;
        });
    };

    function calculateStats() {
      var now = new Date();
      var total = $scope.registrations.length;
      var upcoming = 0;
      var cancelled = 0;
      var completed = 0;

      $scope.registrations.forEach(function (r) {
        if (r.status === 'cancelled') {
          cancelled++;
        } else {
          var eventDate = r.event && r.event.date ? new Date(r.event.date) : null;
          if (eventDate && eventDate >= now) {
            upcoming++;
          } else {
            completed++;
          }
        }
      });

      $scope.stats = {
        total: total,
        upcoming: upcoming,
        cancelled: cancelled,
        completed: completed
      };
    }

    $scope.filterRegistrations = function (reg) {
      // Status filter
      if ($scope.statusFilter && reg.status !== $scope.statusFilter) {
        return false;
      }

      // Search query filter
      if ($scope.searchQuery && $scope.searchQuery.trim() !== '') {
        var query = $scope.searchQuery.toLowerCase().trim();
        var title = (reg.event && reg.event.title) ? reg.event.title.toLowerCase() : '';
        var location = (reg.event && reg.event.location) ? reg.event.location.toLowerCase() : '';
        var category = (reg.event && reg.event.category) ? reg.event.category.toLowerCase() : '';
        return title.indexOf(query) !== -1 || location.indexOf(query) !== -1 || category.indexOf(query) !== -1;
      }

      return true;
    };

    // Open Confirmation Dialog
    $scope.openCancelModal = function (reg) {
      $scope.cancelModal.reg = reg;
      $scope.cancelModal.show = true;
    };

    $scope.closeCancelModal = function () {
      $scope.cancelModal.show = false;
      $scope.cancelModal.reg = null;
    };

    // Confirm Cancellation
    $scope.confirmCancel = function () {
      var reg = $scope.cancelModal.reg;
      if (!reg) return;

      $scope.cancellingId = reg._id;
      RegistrationService.cancel(reg._id)
        .then(function (updatedReg) {
          // Update local status immediately
          reg.status = 'cancelled';
          if (reg.event && typeof reg.event.registeredCount === 'number') {
            reg.event.registeredCount = Math.max(0, reg.event.registeredCount - 1);
          }
          calculateStats();
          AlertService.success('Registration for "' + (reg.event ? reg.event.title : 'Event') + '" cancelled successfully.');
          $scope.closeCancelModal();
        })
        .catch(function (err) {
          var msg = (err.data && err.data.message) ? err.data.message : 'Failed to cancel registration.';
          AlertService.error(msg);
        })
        .finally(function () {
          $scope.cancellingId = null;
        });
    };

    $scope.formatDate = function (dateStr) {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
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

    $scope.formatDateTime = function (dateStr) {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    $scope.loadRegistrations();
  }
]);
