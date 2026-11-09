angular.module('emsApp').directive('appNavbar', ['$location', 'AuthService', 'AlertService', function ($location, AuthService, AlertService) {
  return {
    restrict: 'E',
    templateUrl: 'app/components/navbar/navbar.html',
    scope: {},
    link: function (scope) {
      scope.menuOpen = false;

      scope.toggleMenu = function () {
        scope.menuOpen = !scope.menuOpen;
      };

      scope.closeMenu = function () {
        scope.menuOpen = false;
      };

      scope.isAuthenticated = function () {
        return AuthService.isAuthenticated();
      };

      scope.getUser = function () {
        return AuthService.getCurrentUser();
      };

      scope.getDashboardRoute = function () {
        var user = AuthService.getCurrentUser();
        if (!user) return '/login';
        if (user.role === 'admin') return '/dashboard/admin/overview';
        if (user.role === 'organizer') return '/dashboard/organizer/overview';
        return '/dashboard/participant/overview';
      };

      scope.isActive = function (path) {
        return $location.path() === path;
      };

      scope.logout = function () {
        AuthService.logout();
        AlertService.info('You have logged out successfully.');
        $location.path('/login');
        scope.closeMenu();
      };
    }
  };
}]);
