'use strict';

destservApp.controller('MainCtrl', function($scope, $http) {
    $scope.form = {
        id: 'destinations',
        placeholder: '',
        value: null,
        update: function(val) {
            $scope.form.value = val;
        }
    };
    $scope.layer = {
        duration: 500,
        fieldId: 'destField',
        state: 'off',
        copy: {
            cancel: null
        },
        clickHeader: function(e) {
            var target = ($scope.layer.state === 'off') ? 'show' : e.target.getAttribute('data-ui');
            switch (target) {
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
        clickLayer: function(e) {
            var target = e.target.getAttribute('data-ui'),
                val = e.target.getAttribute('data-value'),
                type = (target === 'location' || target === 'city') ? 'suggestion' : 'void';
            switch (type) {
            case 'suggestion':
                $scope.form.update(val);
                $scope.layer.dismiss(e);
                break;
            default:
                $('#' + $scope.layer.fieldId)[0].blur;
            }
            e.stopPropagation();
        },
        clear: function(e) {
            document.forms['destinations'].field.focus();
            document.forms['destinations'].field.value = '';
            $scope.layer.doClear();
            e.stopPropagation();
        },
        dismiss: function(e) {
            $scope.layer.state = 'off';
            e.stopPropagation();
        },
        show: function(e) {
            $scope.layer.state = 'on';
            document.forms['destinations'].field.focus();
            e.stopPropagation();
        },
        submit: function(e) {
            document.forms['destinations'].field.blur();
            $scope.layer.state = 'off';
            $scope.form.update($scope.layer.search.term);
            // e.stopPropagation();
        },
        doClear: function() {
            clearTimeout($scope.layer.search.timeout);
            $scope.layer.search.filter           = '';
            $scope.layer.search.results.raw      = [];
        },
        doSearch: function(url) {
            clearTimeout($scope.layer.search.timeout);
            if ($scope.layer.search.url !== $scope.layer.search.urlCached) {
                $scope.layer.search.timeout = setTimeout(function(){
                  $http.get(url).success(function(data) {
                    $scope.layer.search.results.raw = data;
                    $scope.layer.search.urlCached = url;
                    $scope.layer.search.results.cached = data;
                  });  
                },250);
            } else {
                $scope.layer.search.results.raw = $scope.layer.search.results.cached;
            };
        },
        doFilter: function() {
            $scope.layer.search.hasResults = $scope.layer.search.results.raw.length > 0;
            if ($scope.layer.search.hasResults) {
                $scope.layer.search.results.filtered = _.filter($scope.layer.search.results.raw, function(city){
                    return city.v.toLowerCase().indexOf($scope.layer.search.filter.toLowerCase()) != -1; 
                });
                $scope.layer.search.results.capped = _.first($scope.layer.search.results.filtered, 10);
                // console.log($scope.layer.search.results.capped);
            }
        },
        search: {
            term:'',
            stub: '',
            filter: '',
            placeholder: '',
            url: '',
            urlCached: '',
            hasTerm: false,
            hasStub: false,
            hasFilter: false,
            hasResults: false,
            results: {
                raw:[],
                cached:[],
                filtered:[],
                capped:[]
            },
            timeout: null
        }
    };
    var target               = $('#' + $scope.form.id)[0];
    $scope.form.update(target.getAttribute('data-value'));
    $scope.form.placeholder  = target.getAttribute('data-placeholder');
    $scope.layer.search.placeholder = target.getAttribute('data-placeholder-layer');
    $scope.layer.copy.cancel = target.getAttribute('data-copy-cancel');
    $scope.layer.search.term  = $scope.form.value;

    $scope.$watch('layer.search.term', function() {
        $scope.layer.search.hasTerm = $scope.layer.search.term !== null && $scope.layer.search.term !== '';
        if ($scope.layer.search.hasTerm) {
            $scope.layer.search.hasStub = $scope.layer.search.term.length > 2;
            if ($scope.layer.search.hasStub) {
                $scope.layer.search.stub = $scope.layer.search.term.substring(0,3);
                $scope.layer.search.hasFilter = $scope.layer.search.term.length > 3;
                if ($scope.layer.search.hasFilter) {
                    $scope.layer.search.filter = $scope.layer.search.term;
                }
            } else {
                $scope.layer.search.stub = '';
            }
        }
    }, true);

    $scope.$watch('layer.search.stub', function() {
        if ($scope.layer.search.stub === '') {
            $scope.layer.search.url = '';
        } else {
            $scope.layer.search.url = 'json/' + $scope.layer.search.stub.toLowerCase() + '.json';
        }        
    }, true);

    $scope.$watch('layer.search.filter', function() {
        $scope.layer.doFilter();
    }, true);

    $scope.$watch('layer.search.url', function() {
        if ($scope.layer.search.url !== '') {
            $scope.layer.doSearch($scope.layer.search.url);
        } else {
            $scope.layer.doClear();
        }
    }, true);

    $scope.$watch('layer.search.results.raw', function() {
        $scope.layer.doFilter();
    }, true);
});