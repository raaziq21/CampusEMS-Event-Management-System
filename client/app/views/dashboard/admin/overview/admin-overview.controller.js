angular.module('emsApp').controller('AdminOverviewController', [
  '$scope', 'UserService', 'EventService', 'RegistrationService', 'AuthService', 'AlertService',
  function ($scope, UserService, EventService, RegistrationService, AuthService, AlertService) {
    $scope.loading = true;
    $scope.currentUser = AuthService.getCurrentUser();
    $scope.activeTab = 'overview'; // 'overview', 'events', 'users'

    // Data containers
    $scope.stats = null;
    $scope.events = [];
    $scope.users = [];
    $scope.organizers = [];
    $scope.recentEvents = [];
    $scope.recentRegistrations = [];

    // Filter controls for Events tab
    $scope.eventFilters = {
      search: '',
      category: '',
      status: ''
    };

    // Filter controls for Users tab
    $scope.userFilters = {
      search: '',
      role: ''
    };

    $scope.categories = [
      'workshop',
      'hackathon',
      'seminar',
      'webinar',
      'conference',
      'cultural',
      'sports',
      'social',
      'academic',
      'other'
    ];

    $scope.statuses = [
      'upcoming',
      'ongoing',
      'completed',
      'cancelled'
    ];

    $scope.roles = [
      'participant',
      'organizer',
      'admin'
    ];

    // Modals
    $scope.createEventModal = {
      show: false,
      saving: false,
      event: {}
    };

    $scope.editEventModal = {
      show: false,
      saving: false,
      event: {}
    };

    $scope.deleteEventModal = {
      show: false,
      deleting: false,
      event: null
    };

    $scope.deleteUserModal = {
      show: false,
      deleting: false,
      user: null
    };

    $scope.rosterModal = {
      show: false,
      loading: false,
      event: null,
      registrations: [],
      search: ''
    };

    // ── Load Platform Overview Stats ──
    $scope.loadDashboardData = function () {
      $scope.loading = true;
      UserService.getStats()
        .then(function (data) {
          $scope.stats = data.stats;
          $scope.recentEvents = data.recentEvents || [];
          $scope.recentRegistrations = data.recentRegistrations || [];
        })
        .catch(function (err) {
          AlertService.error('Failed to load administrator statistics.');
        })
        .finally(function () {
          $scope.loading = false;
        });
    };

    // ── Load Events for Event Management Tab ──
    $scope.loadEvents = function () {
      EventService.getAll({ limit: 100 })
        .then(function (data) {
          $scope.events = data.events || [];
        })
        .catch(function (err) {
          AlertService.error('Failed to load events list.');
        });
    };

    // ── Load Users for User Management Tab ──
    $scope.loadUsers = function () {
      UserService.getUsers({ limit: 100 })
        .then(function (data) {
          $scope.users = data.users || [];
        })
        .catch(function (err) {
          AlertService.error('Failed to load users roster.');
        });
    };

    // ── Load Available Organizers for Dropdown ──
    $scope.loadOrganizers = function () {
      UserService.getOrganizers()
        .then(function (orgs) {
          $scope.organizers = orgs;
        });
    };

    // Tab Switcher
    $scope.switchTab = function (tab) {
      $scope.activeTab = tab;
      if (tab === 'events') {
        $scope.loadEvents();
        $scope.loadOrganizers();
      } else if (tab === 'users') {
        $scope.loadUsers();
      } else if (tab === 'overview') {
        $scope.loadDashboardData();
      }
    };

    // ── Event Filters ──
    $scope.filterEvents = function (event) {
      if ($scope.eventFilters.category && event.category !== $scope.eventFilters.category) {
        return false;
      }
      if ($scope.eventFilters.status && event.status !== $scope.eventFilters.status) {
        return false;
      }
      if ($scope.eventFilters.search && $scope.eventFilters.search.trim() !== '') {
        var q = $scope.eventFilters.search.toLowerCase().trim();
        var title = event.title ? event.title.toLowerCase() : '';
        var loc = event.location ? event.location.toLowerCase() : '';
        var org = event.organizer && event.organizer.name ? event.organizer.name.toLowerCase() : '';
        return title.indexOf(q) !== -1 || loc.indexOf(q) !== -1 || org.indexOf(q) !== -1;
      }
      return true;
    };

    // ── User Filters ──
    $scope.filterUsers = function (user) {
      if ($scope.userFilters.role && user.role !== $scope.userFilters.role) {
        return false;
      }
      if ($scope.userFilters.search && $scope.userFilters.search.trim() !== '') {
        var q = $scope.userFilters.search.toLowerCase().trim();
        var name = user.name ? user.name.toLowerCase() : '';
        var email = user.email ? user.email.toLowerCase() : '';
        var phone = user.phone ? user.phone.toLowerCase() : '';
        return name.indexOf(q) !== -1 || email.indexOf(q) !== -1 || phone.indexOf(q) !== -1;
      }
      return true;
    };

    // ── Admin Create Event ──
    $scope.openCreateEventModal = function () {
      $scope.createEventModal.event = {
        title: '',
        description: '',
        category: 'workshop',
        date: '',
        endDate: '',
        location: '',
        capacity: 100,
        status: 'upcoming',
        organizer: '',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80'
      };
      $scope.createEventModal.show = true;
    };

    $scope.closeCreateEventModal = function () {
      $scope.createEventModal.show = false;
    };

    $scope.saveNewEvent = function () {
      var e = $scope.createEventModal.event;
      if (!e.title || !e.description || !e.date || !e.location || !e.capacity) {
        AlertService.warning('Please fill in all required event fields.');
        return;
      }

      $scope.createEventModal.saving = true;
      var payload = angular.copy(e);
      if (!payload.organizer) payload.organizer = null;

      EventService.create(payload)
        .then(function (newEvent) {
          AlertService.success('Event "' + newEvent.title + '" created successfully!');
          $scope.closeCreateEventModal();
          $scope.loadEvents();
          $scope.loadDashboardData();
        })
        .catch(function (err) {
          var msg = (err.data && err.data.message) ? err.data.message : 'Failed to create event.';
          AlertService.error(msg);
        })
        .finally(function () {
          $scope.createEventModal.saving = false;
        });
    };

    // ── Admin Edit Event ──
    $scope.openEditEventModal = function (event) {
      $scope.editEventModal.event = {
        _id: event._id,
        title: event.title,
        description: event.description,
        category: event.category,
        date: event.date ? event.date.substring(0, 16) : '',
        endDate: event.endDate ? event.endDate.substring(0, 16) : '',
        location: event.location,
        capacity: event.capacity,
        status: event.status,
        image: event.image,
        organizer: event.organizer ? (event.organizer._id || event.organizer) : ''
      };
      $scope.editEventModal.show = true;
    };

    $scope.closeEditEventModal = function () {
      $scope.editEventModal.show = false;
    };

    $scope.updateEvent = function () {
      var e = $scope.editEventModal.event;
      if (!e.title || !e.description || !e.location) {
        AlertService.warning('Event title, venue and description are required.');
        return;
      }

      $scope.editEventModal.saving = true;
      var payload = angular.copy(e);
      if (!payload.organizer) payload.organizer = null;

      EventService.update(e._id, payload)
        .then(function (updated) {
          AlertService.success('Event "' + updated.title + '" updated successfully!');
          $scope.closeEditEventModal();
          $scope.loadEvents();
          $scope.loadDashboardData();
        })
        .catch(function (err) {
          var msg = (err.data && err.data.message) ? err.data.message : 'Failed to update event.';
          AlertService.error(msg);
        })
        .finally(function () {
          $scope.editEventModal.saving = false;
        });
    };

    // ── Admin Delete Event ──
    $scope.openDeleteEventModal = function (event) {
      $scope.deleteEventModal.event = event;
      $scope.deleteEventModal.show = true;
    };

    $scope.closeDeleteEventModal = function () {
      $scope.deleteEventModal.show = false;
      $scope.deleteEventModal.event = null;
    };

    $scope.confirmDeleteEvent = function () {
      var event = $scope.deleteEventModal.event;
      if (!event) return;

      $scope.deleteEventModal.deleting = true;
      EventService.delete(event._id)
        .then(function () {
          AlertService.success('Event "' + event.title + '" and all associated registrations deleted successfully.');
          $scope.closeDeleteEventModal();
          $scope.loadEvents();
          $scope.loadDashboardData();
        })
        .catch(function (err) {
          var msg = (err.data && err.data.message) ? err.data.message : 'Failed to delete event.';
          AlertService.error(msg);
        })
        .finally(function () {
          $scope.deleteEventModal.deleting = false;
        });
    };

    // ── User Role Change ──
    $scope.changeRole = function (user, newRole) {
      if (user._id === $scope.currentUser._id) {
        AlertService.warning('Security Guard: You cannot change your own role.');
        return;
      }

      if (!confirm('Are you sure you want to change ' + user.name + '\'s role to "' + newRole + '"?')) {
        return;
      }

      UserService.updateRole(user._id, newRole)
        .then(function (updatedUser) {
          user.role = updatedUser.role;
          AlertService.success(user.name + '\'s role updated to ' + newRole);
          $scope.loadDashboardData();
          $scope.loadOrganizers();
        })
        .catch(function (err) {
          var msg = (err.data && err.data.message) ? err.data.message : 'Failed to update role.';
          AlertService.error(msg);
        });
    };

    // ── Delete User ──
    $scope.openDeleteUserModal = function (user) {
      if (user._id === $scope.currentUser._id) {
        AlertService.warning('Security Guard: You cannot delete your own account.');
        return;
      }
      $scope.deleteUserModal.user = user;
      $scope.deleteUserModal.show = true;
    };

    $scope.closeDeleteUserModal = function () {
      $scope.deleteUserModal.show = false;
      $scope.deleteUserModal.user = null;
    };

    $scope.confirmDeleteUser = function () {
      var user = $scope.deleteUserModal.user;
      if (!user) return;

      $scope.deleteUserModal.deleting = true;
      UserService.deleteUser(user._id)
        .then(function () {
          AlertService.success('User account ' + user.name + ' deleted successfully.');
          $scope.closeDeleteUserModal();
          $scope.loadUsers();
          $scope.loadDashboardData();
        })
        .catch(function (err) {
          var msg = (err.data && err.data.message) ? err.data.message : 'Failed to delete user.';
          AlertService.error(msg);
        })
        .finally(function () {
          $scope.deleteUserModal.deleting = false;
        });
    };

    // ── Attendee Roster Modal & CSV Export ──
    $scope.openRosterModal = function (event) {
      $scope.rosterModal.event = event;
      $scope.rosterModal.registrations = [];
      $scope.rosterModal.search = '';
      $scope.rosterModal.loading = true;
      $scope.rosterModal.show = true;

      RegistrationService.getEventRegistrations(event._id)
        .then(function (data) {
          $scope.rosterModal.registrations = data.registrations || [];
        })
        .catch(function (err) {
          AlertService.error('Failed to load event attendee roster.');
        })
        .finally(function () {
          $scope.rosterModal.loading = false;
        });
    };

    $scope.closeRosterModal = function () {
      $scope.rosterModal.show = false;
      $scope.rosterModal.event = null;
    };

    $scope.filterRoster = function (reg) {
      if (!$scope.rosterModal.search || $scope.rosterModal.search.trim() === '') {
        return true;
      }
      var q = $scope.rosterModal.search.toLowerCase().trim();
      var name = (reg.user && reg.user.name) ? reg.user.name.toLowerCase() : '';
      var email = (reg.user && reg.user.email) ? reg.user.email.toLowerCase() : '';
      return name.indexOf(q) !== -1 || email.indexOf(q) !== -1;
    };

    $scope.exportRosterCSV = function () {
      var event = $scope.rosterModal.event;
      var regs = $scope.rosterModal.registrations;
      if (!regs || regs.length === 0) {
        AlertService.warning('No attendee records to export.');
        return;
      }

      var csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Student Name,Email Address,Phone,Registered At,Status\n";

      regs.forEach(function (r) {
        var name = r.user ? '"' + r.user.name.replace(/"/g, '""') + '"' : 'N/A';
        var email = r.user ? '"' + r.user.email + '"' : 'N/A';
        var phone = r.user && r.user.phone ? '"' + r.user.phone + '"' : 'N/A';
        var date = r.registeredAt ? '"' + new Date(r.registeredAt).toISOString() + '"' : 'N/A';
        var status = '"' + r.status + '"';
        csvContent += [name, email, phone, date, status].join(",") + "\n";
      });

      var encodedUri = encodeURI(csvContent);
      var link = document.createElement("a");
      var filename = (event ? event.title.replace(/[^a-zA-Z0-9]/g, "_") : "Event") + "_Roster.csv";
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      AlertService.success('Attendee roster exported successfully.');
    };

    $scope.formatDate = function (dateStr) {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    $scope.formatDateTime = function (dateStr) {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Initialize Overview
    $scope.loadDashboardData();
  }
]);
