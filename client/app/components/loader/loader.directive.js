angular.module('emsApp').directive('appLoader', function () {
  return {
    restrict: 'E',
    templateUrl: 'app/components/loader/loader.html',
    scope: {
      message: '@?'
    }
  };
});
