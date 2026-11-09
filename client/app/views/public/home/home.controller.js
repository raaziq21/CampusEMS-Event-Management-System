angular.module('emsApp').controller('HomeController', ['$scope', 'EventService', 'AlertService', function ($scope, EventService, AlertService) {
  $scope.loading = true;
  $scope.featuredEvents = [];
  $scope.stats = {
    totalEvents: 8,
    activeStudents: 250,
    categories: 6,
    satisfaction: '99%'
  };

  function loadFeatured() {
    $scope.loading = true;
    EventService.getAll({ limit: 6, sort: 'date' })
      .then(function (data) {
        $scope.featuredEvents = data.events || [];
      })
      .catch(function (err) {
        AlertService.error('Failed to load featured events.');
      })
      .finally(function () {
        $scope.loading = false;
      });
  }

  loadFeatured();
}]);
