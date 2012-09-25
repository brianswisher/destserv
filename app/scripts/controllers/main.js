'use strict';

destservApp.controller('MainCtrl', function($scope) {    
	$scope.form = {
        id: 'destinations',
        placeholder:null,
        value:null,
        update: function(val) {
            $scope.form.value = val;
        }
	};
    $scope.layer = {
        duration: 500,
        fieldId: 'destField',
        state: 'off',
        copy: {
            cancel:null
        },
        placeholder:null,
        searchTerm: '',
        clickHeader: function(e){
            var target = ($scope.layer.state === 'off') ? 'show' : e.target.getAttribute('data-ui');
            switch (target){
                case 'cancel':                    
                    $scope.layer.dismiss(e);
                    break;
                case 'clear':
                    $scope.layer.clear(e);
                    break;
                case 'show':
                    $scope.layer.show(e);
            }
            e.stopPropagation();
        },
        clickLayer: function(e){
            var target = e.target.getAttribute('data-ui'),
                val = e.target.getAttribute('data-value'),
                type = (target === 'location' || target === 'city') ? 'suggestion' : 'void';
            switch (type){
                case 'suggestion':          
                    $scope.layer.placeholder = val;          
                    $scope.form.update(val);
                    $scope.layer.dismiss(e);
                    break;
                default:
                    $('#'+$scope.layer.fieldId)[0].blur;
            }
            e.stopPropagation();
        },
        clear: function(e){
            document.forms['destinations'].field.focus();
            document.forms['destinations'].field.value='';
            e.stopPropagation();
        },
        dismiss: function(e){
            $scope.layer.state = 'off';
            e.stopPropagation();
        },        
        show: function(e){
            $scope.layer.state = 'on';
            document.forms['destinations'].field.focus();
            e.stopPropagation();
        },
        submit: function(e){
            document.forms['destinations'].field.blur();
            $scope.layer.state = 'off';
            e.stopPropagation();
        }
    };
    var target               = $('#'+$scope.form.id)[0];
    $scope.form.update(target.getAttribute('data-value'));
    $scope.form.placeholder  = target.getAttribute('data-placeholder');
    $scope.layer.placeholder = $scope.form.value || $scope.form.placeholder;
    $scope.layer.copy.cancel = target.getAttribute('data-copy-cancel');
    $scope.layer.searchTerm  = $scope.form.value
});
