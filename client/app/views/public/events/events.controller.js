angular.module('emsApp').controller('EventsController', ['$scope', '$location', 'EventService', 'AlertService', function ($scope, $location, EventService, AlertService) {
  $scope.loading = true;
  $scope.events = [];
  $scope.pagination = {
    current: 1,
    pages: 1,
    total: 0,
    limit: 9
  };

  $scope.filters = {
    search: '',
    category: '',
    status: '',
    sort: 'date'
  };

  $scope.categories = [
    { value: '', label: 'All Categories' },
    { value: 'workshop', label: 'Workshops' },
    { value: 'hackathon', label: 'Hackathons' },
    { value: 'seminar', label: 'Seminars' },
    { value: 'webinar', label: 'Webinars' },
    { value: 'conference', label: 'Conferences' },
    { value: 'cultural', label: 'Cultural & Fests' },
    { value: 'academic', label: 'Academic' }
  ];

  $scope.statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' }
  ];

  $scope.sortOptions = [
    { value: 'date', label: 'Event Date (Earliest First)' },
    { value: '-date', label: 'Event Date (Latest First)' },
    { value: '-createdAt', label: 'Recently Added' },
    { value: 'title', label: 'Title (A - Z)' }
  ];

  $scope.loadEvents = function (page) {
    $scope.loading = true;
    var params = {
      page: page || $scope.pagination.current,
      limit: $scope.pagination.limit,
      sort: $scope.filters.sort
    };

    if ($scope.filters.search && $scope.filters.search.trim() !== '') {
      params.search = $scope.filters.search.trim();
    }
    if ($scope.filters.category) {
      params.category = $scope.filters.category;
    }
    if ($scope.filters.status) {
      params.status = $scope.filters.status;
    }

    EventService.getAll(params)
      .then(function (data) {
        $scope.events = data.events || [];
        $scope.pagination = data.pagination || $scope.pagination;
      })
      .catch(function (err) {
        AlertService.error('Failed to load events. Please check connection.');
      })
      .finally(function () {
        $scope.loading = false;
      });
  };

  $scope.applyFilters = function () {
    $scope.pagination.current = 1;
    $scope.loadEvents(1);
  };

  $scope.resetFilters = function () {
    $scope.filters.search = '';
    $scope.filters.category = '';
    $scope.filters.status = '';
    $scope.filters.sort = 'date';
    $scope.applyFilters();
  };

  $scope.goToPage = function (pageNum) {
    if (pageNum < 1 || pageNum > $scope.pagination.pages) return;
    $scope.pagination.current = pageNum;
    $scope.loadEvents(pageNum);
  };

  // Initialize
  $scope.loadEvents(1);
}]);
