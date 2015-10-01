'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('app');

angular.module('app').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'views/home.html'
		}).
		state('blog', {
			url: '/blog',
			templateUrl: 'views/blog.html'
		});
	}
]);

angular.module('app').run(['$rootScope', function($rootScope){
	var authPreventer = $rootScope.$on('$locationChangeStart', function(event, newUrl, oldUrl){
		var re = new RegExp("#!\/blog");
		if(re.test(newUrl)){
			$rootScope.head_class = "header-blog"
		} else {
			$rootScope.head_class = ""
		}
	});
}]);

angular.module('app').directive("scroll", function ($window) {
    return function(scope, element, attrs) {
        angular.element($window).bind("scroll", function() {
			if (this.pageYOffset >= 50) {
				scope.header_nav_class = "navbar-scroll"
			} else {
				scope.header_nav_class = ""
			}
            scope.$apply();
        });
    };
});



