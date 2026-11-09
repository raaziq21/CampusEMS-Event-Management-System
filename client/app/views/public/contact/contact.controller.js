angular.module('emsApp').controller('ContactController', ['$scope', 'AlertService', function ($scope, AlertService) {
  $scope.contact = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  $scope.submitting = false;
  $scope.submitted = false;

  $scope.submitContact = function () {
    if (!$scope.contact.name || !$scope.contact.email || !$scope.contact.message) {
      AlertService.warning('Please fill out all required contact fields.');
      return;
    }

    $scope.submitting = true;
    setTimeout(function () {
      $scope.$apply(function () {
        $scope.submitting = false;
        $scope.submitted = true;
        AlertService.success('Thank you! Your inquiry has been received. Our team will contact you shortly.');
      });
    }, 800);
  };
}]);
