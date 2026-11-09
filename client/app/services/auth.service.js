/**
 * Auth Service
 * Manages user authentication, token storage, and role verification.
 */
angular.module('emsApp').factory('AuthService', ['$http', '$q', '$window', function ($http, $q, $window) {
  var TOKEN_KEY = 'ems_auth_token';
  var USER_KEY = 'ems_auth_user';

  var currentUser = null;

  // Restore session from localStorage on bootstrap
  try {
    var savedUser = $window.localStorage.getItem(USER_KEY);
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
    }
  } catch (e) {
    $window.localStorage.removeItem(USER_KEY);
  }

  function getToken() {
    return $window.localStorage.getItem(TOKEN_KEY);
  }

  function setSession(token, user) {
    currentUser = user;
    $window.localStorage.setItem(TOKEN_KEY, token);
    $window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    currentUser = null;
    $window.localStorage.removeItem(TOKEN_KEY);
    $window.localStorage.removeItem(USER_KEY);
  }

  function login(credentials) {
    return $http.post('/api/auth/login', credentials).then(function (res) {
      if (res.data && res.data.success && res.data.data) {
        setSession(res.data.data.token, res.data.data.user);
        return res.data.data;
      }
      return $q.reject(res.data ? res.data.message : 'Login failed');
    });
  }

  function register(userData) {
    return $http.post('/api/auth/register', userData).then(function (res) {
      if (res.data && res.data.success && res.data.data) {
        setSession(res.data.data.token, res.data.data.user);
        return res.data.data;
      }
      return $q.reject(res.data ? res.data.message : 'Registration failed');
    });
  }

  function logout() {
    clearSession();
  }

  function getCurrentUser() {
    return currentUser;
  }

  function isAuthenticated() {
    return !!getToken() && !!currentUser;
  }

  function hasRole(roles) {
    if (!isAuthenticated() || !currentUser) return false;
    if (typeof roles === 'string') {
      return currentUser.role === roles;
    }
    if (Array.isArray(roles)) {
      return roles.indexOf(currentUser.role) !== -1;
    }
    return false;
  }

  function refreshCurrentUser() {
    if (!getToken()) return $q.reject('No token');
    return $http.get('/api/auth/me').then(function (res) {
      if (res.data && res.data.data && res.data.data.user) {
        currentUser = res.data.data.user;
        $window.localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
        return currentUser;
      }
    });
  }

  return {
    login: login,
    register: register,
    logout: logout,
    getToken: getToken,
    getCurrentUser: getCurrentUser,
    isAuthenticated: isAuthenticated,
    hasRole: hasRole,
    refreshCurrentUser: refreshCurrentUser
  };
}]);
