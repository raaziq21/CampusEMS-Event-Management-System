angular.module('emsApp').controller('AboutController', ['$scope', function ($scope) {
  $scope.techStack = [
    { name: 'AngularJS 1.8.x', category: 'Frontend SPA', desc: 'Two-way data binding, ngRoute, custom directives & services.', icon: 'fab fa-angular', color: '#dd0031' },
    { name: 'Node.js & Express', category: 'Backend Server', desc: 'RESTful API architecture, centralized error handling & CORS.', icon: 'fab fa-node-js', color: '#68a063' },
    { name: 'MongoDB Atlas', category: 'Database', desc: 'NoSQL document storage, compound unique indexes & Mongoose ODM.', icon: 'fas fa-database', color: '#13aa52' },
    { name: 'JWT & Bcrypt', category: 'Cybersecurity', desc: 'Cryptographic password hashing and stateless token authorization.', icon: 'fas fa-shield-alt', color: '#4f46e5' }
  ];
}]);
