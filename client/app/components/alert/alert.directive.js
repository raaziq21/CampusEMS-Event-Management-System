angular.module('emsApp').directive('appAlerts', ['AlertService', function (AlertService) {
  return {
    restrict: 'E',
    templateUrl: 'app/components/alert/alert.html',
    scope: {},
    link: function (scope) {
      scope.alerts = AlertService.getAlerts();
      scope.closeAlert = function (id) {
        AlertService.remove(id);
      };
    }
  };
}]);
