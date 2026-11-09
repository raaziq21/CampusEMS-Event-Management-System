/**
 * Event Management System (EMS) — AngularJS 1.8.x Main Application Module
 */

var emsApp = angular.module('emsApp', ['ngRoute']);

// ============================================================================
// HTTP Interceptor for JWT Authentication
// ============================================================================
emsApp.factory('AuthInterceptor', ['$q', '$window', '$injector', function ($q, $window, $injector) {
  return {
    request: function (config) {
      // Attach JWT token from localStorage to all outgoing API requests
      var token = $window.localStorage.getItem('ems_auth_token');
      if (token && config.url.indexOf('/api/') === 0) {
        config.headers = config.headers || {};
        config.headers.Authorization = 'Bearer ' + token;
      }
      return config;
    },

    responseError: function (rejection) {
      // If 401 Unauthorized received, clear session and redirect to login
      if (rejection.status === 401 && rejection.config.url.indexOf('/api/auth/login') === -1) {
        $window.localStorage.removeItem('ems_auth_token');
        $window.localStorage.removeItem('ems_auth_user');
        var $location = $injector.get('$location');
        var AlertService = $injector.get('AlertService');
        AlertService.warning('Your session has expired. Please sign in again.');
        $location.path('/login');
      }
      return $q.reject(rejection);
    }
  };
}]);

// ============================================================================
// Application Configuration & Route Provider
// ============================================================================
emsApp.config(['$routeProvider', '$httpProvider', '$locationProvider', function ($routeProvider, $httpProvider, $locationProvider) {
  // Register Auth Interceptor
  $httpProvider.interceptors.push('AuthInterceptor');

  // Route Definitions
  $routeProvider
    // Public Pages
    .when('/', {
      templateUrl: 'app/views/public/home/home.html',
      controller: 'HomeController'
    })
    .when('/events', {
      templateUrl: 'app/views/public/events/events.html',
      controller: 'EventsController'
    })
    .when('/events/:id', {
      templateUrl: 'app/views/public/event-detail/event-detail.html',
      controller: 'EventDetailController'
    })
    .when('/about', {
      templateUrl: 'app/views/public/about/about.html',
      controller: 'AboutController'
    })
    .when('/contact', {
      templateUrl: 'app/views/public/contact/contact.html',
      controller: 'ContactController'
    })

    // Auth Pages
    .when('/login', {
      templateUrl: 'app/views/auth/login/login.html',
      controller: 'LoginController'
    })
    .when('/register', {
      templateUrl: 'app/views/auth/register/register.html',
      controller: 'RegisterController'
    })

    // Dashboard Routes
    .when('/dashboard/admin', {
      redirectTo: '/dashboard/admin/overview'
    })
    .when('/dashboard/admin/overview', {
      templateUrl: 'app/views/dashboard/admin/overview/overview.html',
      controller: 'AdminOverviewController',
      requiredRole: 'admin'
    })
    .when('/dashboard/organizer', {
      redirectTo: '/dashboard/organizer/overview'
    })
    .when('/dashboard/organizer/overview', {
      templateUrl: 'app/views/dashboard/organizer/overview/overview.html',
      controller: 'OrganizerOverviewController',
      requiredRole: 'organizer'
    })
    .when('/dashboard/participant', {
      redirectTo: '/dashboard/participant/overview'
    })
    .when('/dashboard/participant/overview', {
      templateUrl: 'app/views/dashboard/participant/overview/overview.html',
      controller: 'ParticipantOverviewController',
      requiredRole: 'participant'
    })
    .when('/dashboard/participant/registrations', {
      redirectTo: '/dashboard/participant/overview'
    })
    .when('/my-registrations', {
      redirectTo: '/dashboard/participant/overview'
    })
    .when('/profile', {
      redirectTo: '/dashboard/profile'
    })
    .when('/dashboard/profile', {
      templateUrl: 'app/views/dashboard/profile/profile.html',
      controller: 'ProfileController',
      requiresAuth: true
    })

    // Fallback
    .otherwise({
      redirectTo: '/'
    });
}]);

// ============================================================================
// Run Block — Route Guards & Global Auth Listeners
// ============================================================================
emsApp.run(['$rootScope', '$location', 'AuthService', 'AlertService', function ($rootScope, $location, AuthService, AlertService) {
  $rootScope.$on('$routeChangeStart', function (event, next, current) {
    if (!next) return;

    var requiresAuth = next.requiresAuth || !!next.requiredRole;
    var requiredRole = next.requiredRole;

    if (requiresAuth && !AuthService.isAuthenticated()) {
      event.preventDefault();
      AlertService.warning('Please log in to access this page.');
      $location.path('/login');
      return;
    }

    if (requiredRole && !AuthService.hasRole(requiredRole)) {
      event.preventDefault();
      AlertService.error('Access denied. Role "' + requiredRole + '" required.');
      var user = AuthService.getCurrentUser();
      if (user) {
        if (user.role === 'admin') $location.path('/dashboard/admin/overview');
        else if (user.role === 'organizer') $location.path('/dashboard/organizer/overview');
        else $location.path('/dashboard/participant/overview');
      } else {
        $location.path('/login');
      }
    }
  });
}]);
