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

angular.module('app').value('duScrollOffset', 60).value('duScrollGreedy', true);

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
		state('hobby', {
			url: '/hobby',
			templateUrl: 'views/hobby.html'
		}).
		state('blog', {
			url: '/blog',
			abstract: true,
			templateUrl: 'views/blog.html'
		})
		.state('blog.home', {
		    url: "",
		    templateUrl: "views/blog-home.html"
		})
		.state('blog.subpage', {
		    url: "/{blogId}",
		    templateUrl: function ($stateParams){
		    	return 'mds/' + $stateParams.blogId + '.md';
		    }
		});
	}
]);

angular.module('app').run(['$rootScope', '$location', function($rootScope, $location){

	$rootScope.updateHash = function(newHash) {
		$location.hash(newHash);
	}

	// var authPreventer = $rootScope.$on('$locationChangeStart', function(event, newUrl, oldUrl){
	// 	var re = new RegExp("#!\/blog");
	// 	if(re.test(newUrl)){
	// 		$rootScope.head_class = "header-blog"
	// 	} else {
	// 		$rootScope.head_class = ""
	// 	}
	// });
}]);

angular.module('app').directive("scroll", function ($window) {
    return function(scope, element, attrs) {
    	scope.lastPageYOffset = 0;
        angular.element($window).bind("scroll", function(a, b) {
        	
        	if(this.pageYOffset > scope.lastPageYOffset && this.pageYOffset > 50) {
        		scope.header_nav_class = ""
        		scope.head_class = "hidden"
        	} else {
        		scope.head_class = ""
        		scope.header_nav_class = "navbar-scroll"
        		if (this.pageYOffset < 50) {
        			scope.header_nav_class = ""
        		}
        	}
			scope.lastPageYOffset = this.pageYOffset;
            scope.$apply();
        });
    };
});

angular.module('app').directive('setClassWhenAtTop', function ($window) {
  var $win = angular.element($window); // wrap window object as jQuery object

  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var topClass = attrs.setClassWhenAtTop, // get CSS class from directive's attribute value
          offsetTop = element.offset().top; // get element's offset top relative to document

      $win.on('scroll', function (e) {
        if ($win.scrollTop() >= offsetTop - 80) {
          element.addClass(topClass);
        } else {
          element.removeClass(topClass);
        }
      });
    }
  };
});


