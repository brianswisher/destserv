'use strict';

destservApp.controller('MainCtrl', function($scope) {    
	$scope.form = {
        id: 'destinations',
        placeholder:null,
        value:null
	};
    $scope.layer = {
        duration: 500,
        state: 'off',
        copy: {
            cancel:null
        },
        click: function(e){
            var target = ($scope.layer.state === 'off') ? 'show' : e.target.getAttribute('data-ui');
            switch (target){
                case 'cancel':                    
                    $scope.layer.cancel(e);
                    break;
                case 'clear':
                    $scope.layer.clear(e);
                    break;
                case 'show':
                    $scope.layer.show(e);
            }
            e.stopPropagation();
        },
        clear: function(e){
            document.forms['destinations'].field.focus();
            document.forms['destinations'].field.value='';
            e.stopPropagation();
        },
        cancel: function(e){
            $scope.layer.state = 'off';
            e.stopPropagation();
        },
        submit: function(e){
            document.forms['destinations'].field.blur();
            $scope.layer.state = 'off';
            e.stopPropagation();
        },
        show: function(e){
            $scope.layer.state = 'on';
            document.forms['destinations'].field.focus();
            e.stopPropagation();
        },
        select: function(e){
            e.stopPropagation();
        }
    };
    var target = $('#'+$scope.form.id)[0];
    $scope.form.placeholder = target.getAttribute('data-placeholder');
    $scope.form.value       = target.getAttribute('data-value');
    $scope.layer.copy.cancel = target.getAttribute('data-copy-cancel');
});
