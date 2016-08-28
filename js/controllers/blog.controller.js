'use strict';

/******************
 * Markdown is used for individual blog article
 * ## h2   --- title
 * ### h3  --- section
 * #### h4 --- subsection
 *******************/
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
			if (matches && matches.length > 1) {
				identifier = matches[1];
			}
			$scope.disqusConfig = {
				disqus_shortname: 'wangyangjun',
				disqus_identifier: identifier,
				disqus_url: window.location.href
			};
		}

		$scope.init = function() {
			$scope.updateState($state.current);
			$scope.setDisqusConfig();

			$.get('blogs.json', function(blogs) {
				$scope.blogs = blogs;
				$scope.$applyAsync();
				console.log("blogs loaded");
			});
		};

		$scope.$on('$stateChangeStart', function(event, toState, toParams) {
			$scope.updateState(toState);
		});

		$scope.$on('$locationChangeSuccess', function(newUrl, oldUrl) {
			$scope.setDisqusConfig();
		});

		$scope.$on('$viewContentLoaded', function() {
			var elements = $($element.find("[marked]")[0]).find("[id]")
				.filter((i, e) => e.tagName !== 'H1' && e.tagName !== 'H2');
			$scope.contents = [];
			_.forEach(elements, (e) => {
				switch (e.tagName) {
					case 'H3':
						$scope.contents.push({
							'id': e.id,
							'text': e.innerText,
							'subcontents': []
						});
						break;
					case 'H4':
						if ($scope.contents.length > 0) {
							$scope.contents[$scope.contents.length-1].subcontents.push({
								'id': e.id,
								'text': e.innerText
							});
						}
						break;
					default:
						break;
				}
			});

			$scope.elementsWithId = elements.map(function(i, e) {
				return {
					'id': e.id,
					'text': e.innerText
				}
			});
			$scope.$applyAsync();
		});
	}
]);