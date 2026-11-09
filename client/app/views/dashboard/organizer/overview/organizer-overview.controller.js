angular.module('emsApp').controller('OrganizerOverviewController', [
  '$scope', '$http', 'EventService', 'RegistrationService', 'AuthService', 'AlertService',
  function ($scope, $http, EventService, RegistrationService, AuthService, AlertService) {
    $scope.loading = true;
    $scope.user = AuthService.getCurrentUser();
    $scope.assignedEvents = [];

    // Analytics
    $scope.analytics = {
      totalEvents: 0,
      totalRegistrations: 0,
      totalCapacity: 0,
      avgFillRate: 0
    };

    // Category options
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

    // Modals state
    $scope.createModal = {
      show: false,
      saving: false,
      event: {}
    };

    $scope.editModal = {
      show: false,
      saving: false,
      event: {}
    };

    $scope.rosterModal = {
      show: false,
      loading: false,
      event: null,
      registrations: [],
      search: ''
    };

    // Load Assigned Events
    $scope.loadEvents = function () {
      $scope.loading = true;
      EventService.getAll({ limit: 50, organizer: $scope.user._id })
        .then(function (data) {
          $scope.assignedEvents = data.events || [];
          calculateAnalytics();
        })
        .catch(function (err) {
          AlertService.error('Failed to load your assigned events.');
        })
        .finally(function () {
          $scope.loading = false;
        });
    };

    function calculateAnalytics() {
      var count = $scope.assignedEvents.length;
      var totalRegs = 0;
      var totalCap = 0;

      $scope.assignedEvents.forEach(function (e) {
        totalRegs += (e.registeredCount || 0);
        totalCap += (e.capacity || 0);
      });

      var fillRate = totalCap > 0 ? Math.round((totalRegs / totalCap) * 100) : 0;

      $scope.analytics = {
        totalEvents: count,
        totalRegistrations: totalRegs,
        totalCapacity: totalCap,
        avgFillRate: fillRate
      };
    }

    // ── Create Event ──
    $scope.openCreateModal = function () {
      $scope.createModal.event = {
        title: '',
        description: '',
        category: 'workshop',
        date: '',
        endDate: '',
        location: '',
        capacity: 100,
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80'
      };
      $scope.createModal.show = true;
    };

    $scope.closeCreateModal = function () {
      $scope.createModal.show = false;
    };

    $scope.saveNewEvent = function () {
      var e = $scope.createModal.event;
      if (!e.title || !e.description || !e.date || !e.location || !e.capacity) {
        AlertService.warning('Please fill in all required event fields.');
        return;
      }

      $scope.createModal.saving = true;
      EventService.create(e)
        .then(function (newEvent) {
          AlertService.success('Event "' + newEvent.title + '" created successfully!');
          $scope.closeCreateModal();
          $scope.loadEvents();
        })
        .catch(function (err) {
          var msg = (err.data && err.data.message) ? err.data.message : 'Failed to create event.';
          AlertService.error(msg);
        })
        .finally(function () {
          $scope.createModal.saving = false;
        });
    };

    // ── Edit Event ──
    $scope.openEditModal = function (event) {
      $scope.editModal.event = {
        _id: event._id,
        title: event.title,
        description: event.description,
        category: event.category,
        date: event.date ? event.date.substring(0, 16) : '',
        endDate: event.endDate ? event.endDate.substring(0, 16) : '',
        location: event.location,
        capacity: event.capacity,
        status: event.status,
        image: event.image
      };
      $scope.editModal.show = true;
    };

    $scope.closeEditModal = function () {
      $scope.editModal.show = false;
    };

    $scope.updateEvent = function () {
      var e = $scope.editModal.event;
      if (!e.title || !e.description || !e.location) {
        AlertService.warning('Title, description and venue cannot be empty.');
        return;
      }

      $scope.editModal.saving = true;
      EventService.update(e._id, e)
        .then(function (updated) {
          AlertService.success('Event "' + updated.title + '" updated successfully!');
          $scope.closeEditModal();
          $scope.loadEvents();
        })
        .catch(function (err) {
          var msg = (err.data && err.data.message) ? err.data.message : 'Failed to update event.';
          AlertService.error(msg);
        })
        .finally(function () {
          $scope.editModal.saving = false;
        });
    };

    // ── View Participants Roster ──
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
          AlertService.error('Failed to load registered attendees.');
        })
        .finally(function () {
          $scope.rosterModal.loading = false;
        });
    };

    $scope.closeRosterModal = function () {
      $scope.rosterModal.show = false;
      $scope.rosterModal.event = null;
      $scope.rosterModal.registrations = [];
    };

    $scope.filterRoster = function (reg) {
      if (!$scope.rosterModal.search || $scope.rosterModal.search.trim() === '') {
        return true;
      }
      var q = $scope.rosterModal.search.toLowerCase().trim();
      var name = (reg.user && reg.user.name) ? reg.user.name.toLowerCase() : '';
      var email = (reg.user && reg.user.email) ? reg.user.email.toLowerCase() : '';
      var phone = (reg.user && reg.user.phone) ? reg.user.phone.toLowerCase() : '';
      return name.indexOf(q) !== -1 || email.indexOf(q) !== -1 || phone.indexOf(q) !== -1;
    };

    // ── Export Attendee Roster as CSV ──
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
      var filename = (event ? event.title.replace(/[^a-zA-Z0-9]/g, "_") : "Event") + "_Attendees.csv";
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

    $scope.loadEvents();
  }
]);
