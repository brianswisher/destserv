'use strict';

destservApp.controller('MainCtrl', function($scope) {    
	$scope.form = {
        id: 'destinations',
        placeholder:null,
        value:null
	};
    var target = $('#'+$scope.form.id)[0];
    $scope.form.placeholder = target.getAttribute('data-placeholder');
    $scope.form.value       = target.getAttribute('data-value');
});
