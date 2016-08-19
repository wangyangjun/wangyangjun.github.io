'use strict';

angular.module('app').controller('HeaderController', ['$scope', '$rootScope', 
	function($scope, $rootScope) {
		//$scope.header_nav_class = "navbar-scroll"
		console.log("Load HeaderController")
		$scope.collapseMenu = function() {
		    if ($(window).width() <= 768) {
		        console.log('hiding');
		        $scope.navCollapsed = true;
		    }
		} 
	}
]);

