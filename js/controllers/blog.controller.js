'use strict';

angular.module('app').controller('BlogController', ['$scope', '$rootScope', '$element', '$state',
	function($scope, $rootScope, $element, $state) {
		

		$scope.init = function () {
			$scope.blogHome = false;
			if ($state.current.name === 'blog.home') {
				$scope.blogHome = true;
			}

		    $.get('blogs.json', function(blogs) {
	        	$scope.blogs = blogs;
	        	console.log("blogs loaded");
		    });
		};

	    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options){
	    	$scope.blogHome = false;
			if (toState.name === 'blog.home') {
				$scope.blogHome = true;
			}
	 	});

		$scope.$on('$viewContentLoaded', function(){
			var elements = [];
			// first one is title
			elements = $($element.find("[marked]")[0]).find("[id]").slice(1);
			$scope.elementsWithId = elements.map(function(i, e){ return {'id': e.id, 'text': e.innerText}});
			$scope.$applyAsync();
		});
	}
]);
