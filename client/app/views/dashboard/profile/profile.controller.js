angular.module('emsApp').controller('ProfileController', [
  '$scope', '$http', 'AuthService', 'AlertService',
  function ($scope, $http, AuthService, AlertService) {
    $scope.loading = true;
    $scope.savingProfile = false;
    $scope.changingPassword = false;
    $scope.activeTab = 'profile'; // 'profile' or 'security'

    $scope.user = null;
    $scope.profileForm = {
      name: '',
      phone: ''
    };

    $scope.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    function loadProfile() {
      $scope.loading = true;
      $http.get('/api/users/profile/me')
        .then(function (res) {
          if (res.data && res.data.data) {
            $scope.user = res.data.data.user;
            $scope.profileForm.name = $scope.user.name;
            $scope.profileForm.phone = $scope.user.phone || '';
          }
        })
        .catch(function (err) {
          AlertService.error('Failed to load profile details.');
        })
        .finally(function () {
          $scope.loading = false;
        });
    }

    $scope.updateProfile = function () {
      if (!$scope.profileForm.name || $scope.profileForm.name.trim().length < 2) {
        AlertService.warning('Name must be at least 2 characters.');
        return;
      }

      $scope.savingProfile = true;
      $http.put('/api/users/profile/me', $scope.profileForm)
        .then(function (res) {
          if (res.data && res.data.data) {
            $scope.user = res.data.data.user;
          }
          AlertService.success('Profile updated successfully.');
          AuthService.refreshCurrentUser();
        })
        .catch(function (err) {
          var msg = (err.data && err.data.message) ? err.data.message : 'Failed to update profile.';
          AlertService.error(msg);
        })
        .finally(function () {
          $scope.savingProfile = false;
        });
    };

    $scope.changePassword = function () {
      if (!$scope.passwordForm.currentPassword) {
        AlertService.warning('Please enter your current password.');
        return;
      }

      if (!$scope.passwordForm.newPassword || $scope.passwordForm.newPassword.length < 6) {
        AlertService.warning('New password must be at least 6 characters.');
        return;
      }

      if ($scope.passwordForm.newPassword !== $scope.passwordForm.confirmPassword) {
        AlertService.error('New passwords do not match.');
        return;
      }

      $scope.changingPassword = true;
      var payload = {
        currentPassword: $scope.passwordForm.currentPassword,
        newPassword: $scope.passwordForm.newPassword
      };

      $http.put('/api/users/profile/password', payload)
        .then(function () {
          AlertService.success('Password changed successfully! Keep your new credentials safe.');
          $scope.passwordForm.currentPassword = '';
          $scope.passwordForm.newPassword = '';
          $scope.passwordForm.confirmPassword = '';
        })
        .catch(function (err) {
          var msg = (err.data && err.data.message) ? err.data.message : 'Password update failed. Verify current password.';
          AlertService.error(msg);
        })
        .finally(function () {
          $scope.changingPassword = false;
        });
    };

    $scope.formatDate = function (dateStr) {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    };

    loadProfile();
  }
]);
