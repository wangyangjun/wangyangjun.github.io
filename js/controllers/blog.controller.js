'use strict';

angular.module('app').controller('BlogController', ['$scope', '$rootScope', '$element', '$state',
	function($scope, $rootScope, $element, $state) {
		
		$scope.updateState = function(state) {
			$scope.blogHome = false;
			if (state.name === 'blog.home') {
				$scope.blogHome = true;
			}
		}

		$scope.setDisqusConfig = function() {
			var regExp = /\#([^#]+)[\#]?/;
			var matches = regExp.exec(window.location);
			var identifier = window.location.hash;
			if(matches && matches.length > 1) {
				identifier = matches[1];
			}
			$scope.disqusConfig = {
			    disqus_shortname: 'wangyangjun',
			    disqus_identifier: identifier,
			    disqus_url: window.location.href
			};
		}
		
		$scope.init = function () {
			$scope.updateState($state.current);
			$scope.setDisqusConfig();

		    $.get('blogs.json', function(blogs) {
	        	$scope.blogs = blogs;
	        	$scope.$applyAsync();
	        	console.log("blogs loaded");
		    });
		};

	    $scope.$on('$stateChangeStart', function(event, toState, toParams){
	    	$scope.updateState(toState);
	 	});

	    $scope.$on('$locationChangeSuccess', function(newUrl, oldUrl){ 
			$scope.setDisqusConfig();
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
