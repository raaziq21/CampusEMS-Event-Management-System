angular.module('emsApp').directive('eventCard', function () {
  return {
    restrict: 'E',
    templateUrl: 'app/components/event-card/event-card.html',
    scope: {
      event: '='
    },
    controller: ['$scope', function ($scope) {
      $scope.formatDate = function (dateStr) {
        if (!dateStr) return '';
        var d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      };

      $scope.formatTime = function (dateStr) {
        if (!dateStr) return '';
        var d = new Date(dateStr);
        return d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      };
    }]
  };
});
