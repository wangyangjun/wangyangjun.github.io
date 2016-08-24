'use strict';

angular.module('app').controller('BlogController', ['$scope', '$rootScope', '$element', '$state',
	function($scope, $rootScope, $element, $state) {
		
		$scope.state = $state.current; 
		$.get('blogs.json', function(blogs) {
        	$scope.blogs = blogs;
	    });


	    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options){
	    	$scope.state = toState;
	 	});

		$scope.$on('$viewContentLoaded', function(){
			var elements = [];
			// first one is title
			elements = $($element.find("[marked]")[0]).find("[id]").slice(1);
			$scope.elementsWithId = elements.map((i, e) => { return {'id': e.id, 'text': e.innerText}});
		});
	}
]);
