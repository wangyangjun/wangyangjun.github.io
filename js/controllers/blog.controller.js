'use strict';

angular.module('app').controller('BlogController', ['$scope', '$rootScope', '$element',
	function($scope, $rootScope, $element) {

		$scope.$on('$viewContentLoaded', function(){
			var elements = [];
			// first one is title
			elements = $($element.find("[marked]")[0]).find("[id]").slice(1);
			$scope.elementsWithId = elements.map((i, e) => { return {'id': e.id, 'text': e.innerText}});
		});
	}
]);
