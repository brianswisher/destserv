'use strict';

function DestServCtrl($scope, $http, $rootElement) {

    $scope.delay = 250;
    $scope.classname = {
        ready: 'ready'
    };
    $scope.defer = function(func,delay){
        delay = delay || $scope.delay;
        return setTimeout(function() {
            func();
        }, delay);
    }

    $scope.form = {
        placeholder: 'data-placeholder',
        value: null,
        valueAttr: 'data-value',
        input: {
            form: 'data-input-form',
            name: 'data-input-name'
        },
        update: function(val) {
            $scope.form.value = val;
            $scope.form.input.value = val;
        },
        submit: function() {
            var hasGeolocation, errors, hasThem, form;
            form = $scope.form.input.form;
            hasGeolocation = navigator.geolocation;
            errors = $('.errors',form)[0];
            errors.innerHTML = '';
            hasThem = false;
            $(errors.parentNode.parentNode).removeClass('errorEndDate');
            $(errors.parentNode.parentNode).removeClass('errorLocation');
            $(errors.parentNode.parentNode).removeClass('hasErrors');
            if(form.location.value.length<3){
                errors.innerHTML += '<p>Minimum 3 characters required to perform successful search.</p>';
                $(errors).addClass('hasThem');
                hasThem = true;
                $(errors.parentNode.parentNode).addClass('errorLocation');
            }
            if(new Date(form.endDate.value)<=new Date(form.startDate.value)){
                errors.innerHTML += '<p>Check-out date is not valid. The check-out date must be after the check-in date.</p>';
                $(errors).addClass('hasThem');
                hasThem = true;
                $(errors.parentNode.parentNode).addClass('errorEndDate');
            }
            if (hasThem) {
                $(errors.parentNode.parentNode).addClass('hasErrors');
                $scope.layer.refresh();
                return false;
            }
            if(hasGeolocation){
                var self = form,
                    location=$scope.form.input,
                    isLocSearch=location.value.indexOf(self.getAttribute('data-location-key'))!=-1;
                if(isLocSearch){
                    navigator.geolocation.getCurrentPosition(function(position){
                        var coords = [
                                position.coords.latitude,
                                position.coords.longitude
                            ]                                        
                            location.value=coords;
                            location.form.submit();
                        },function(error){
                            var mssg = '';
                            switch(error.code)  {
                              case error.PERMISSION_DENIED:
                                mssg = 'User denied the request for Geolocation.';
                                break;
                              case error.POSITION_UNAVAILABLE:
                                mssg = 'Location information is unavailable.';
                                break;
                              case error.TIMEOUT:
                                mssg = 'The request to get user location timed out.';
                                break;
                              case error.UNKNOWN_ERROR:
                                mssg = 'An unknown error occurred.';
                                break;
                            }
                            alert(mssg);
                        }
                    );
                } else {
                    location.form.submit();
                }
            }
            $scope.layer.refresh();
        }
    };
    $scope.layer = {
        duration: 500,
        form: 'data-layer-form',
        state: 'off',
        copy: {
            cancel: 'data-copy-cancel'
        },
        search: {
            term: '',
            stub: '',
            filter: '',
            placeholder: 'data-placeholder-layer',
            url: '',
            urlCached: '',
            hasTerm: false,
            hasStub: false,
            hasFilter: false,
            hasResults: false,
            results: {
                raw: [],
                cached: [],
                filtered: [],
                capped: []
            },
            timeout: null
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
            e.preventDefault();
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
                    $scope.layer.form.field.blur();
            }
            e.preventDefault();
            e.stopPropagation();
        },
        clear: function(e) {
            $scope.layer.form.field.focus();
            $scope.layer.form.field.value = '';
            $scope.layer.doClear();
            e.preventDefault();
            e.stopPropagation();
        },
        dismiss: function(e) {
            e.preventDefault();
            e.stopPropagation();
            $scope.layer.refresh('off');
        },
        show: function(e) {
            $scope.layer.form.field.focus();
            e.preventDefault();
            e.stopPropagation();
            $scope.layer.refresh('on');
        },
        position: function(type) {
            var top, field;
            field = $('.field.location', $scope.target);
            top = field.position().top;
            if ( type === 'off' ) {
                $scope.defer(function(){
                    $scope.layer.form.style.top = top + 'px'; 
                },1);
            } else {
                $scope.defer(function(){
                    $scope.layer.form.style.top = 0; 
                },1);
            }
        },
        refresh: function(position){
            if ( position ) {
                $scope.layer.state = position;
                $scope.layer.position(position);
            } else {
                if ($scope.layer.state === 'off') {
                    $scope.layer.position('off');
                } else {
                    $scope.layer.position('on');
                }
            }
            $scope.defer(function(){
                if ( window['viewporter'] ) {
                    window.viewporter.refresh();
                }   
            },1);
        },
        submit: function(e) {
            $scope.layer.form.field.blur();
            $scope.layer.state = 'off';
            $scope.form.update($scope.layer.search.term);
            $scope.layer.refresh();
        },
        doClear: function() {
            clearTimeout($scope.layer.search.timeout);
            $scope.layer.search.filter = '';
            $scope.layer.search.results.raw = [];
            $scope.layer.search.results.filtered = [];
            $scope.layer.search.results.capped = [];
        },
        doSearch: function(url) {
            clearTimeout($scope.layer.search.timeout);
            if ($scope.layer.search.url !== $scope.layer.search.urlCached) {
                $scope.layer.search.timeout = $scope.defer(function(){
                    $http.get(url).success(function(data) {
                        $scope.layer.search.results.raw = data;
                        $scope.layer.search.urlCached = url;
                        $scope.layer.search.results.cached = data;
                    });    
                });
            } else {
                $scope.layer.search.results.raw = $scope.layer.search.results.cached;
            };
        },
        doFilter: function() {
            $scope.layer.search.hasResults = $scope.layer.search.results.raw.length > 0;
            if ($scope.layer.search.hasResults) {
                $scope.layer.search.results.filtered = _.filter($scope.layer.search.results.raw, function(city) {
                    return city.v.toLowerCase().indexOf($scope.layer.search.filter.toLowerCase()) != -1;
                });
                $scope.layer.search.results.capped = _.first($scope.layer.search.results.filtered, 10);
            }
        }
    };
    $scope.onready = function(target) {

        // Prepopulate

        $scope.target = target;
        $scope.form.placeholder = target.getAttribute($scope.form.placeholder);
        $scope.form.input.form = target.getAttribute($scope.form.input.form);
        $scope.form.input.name = target.getAttribute($scope.form.input.name);
        $scope.form.input = document.forms[$scope.form.input.form][$scope.form.input.name];
        $scope.form.input.form = document.forms[$scope.form.input.form];
        $scope.layer.search.placeholder = target.getAttribute($scope.layer.search.placeholder);
        $scope.layer.copy.cancel = target.getAttribute($scope.layer.copy.cancel);
        $scope.layer.search.term = $scope.form.value;
        $scope.layer.form = document.forms[target.getAttribute($scope.layer.form)];

        // Init

        $scope.form.update(target.getAttribute($scope.form.valueAttr));
        $scope.form.update($scope.form.value || $scope.form.placeholder);
        $(target).addClass($scope.classname.ready);
        $scope.defer(function(){
            $scope.layer.refresh();
        });
    }

    // $.each( $rootElement, function(i, target) { 
    //     $scope.onready(target); 
    // });
    $.each( $rootElement, function(i, root) { 
        var containers = $('.'+root.getAttribute('data-destserv-class'),root);
        $.each( containers, function(j, target) { 
           $scope.onready(target); 
        });
    });

    // Watch

    $scope.$watch('layer.search.term', function() {
        $scope.layer.search.hasTerm = $scope.layer.search.term !== null && $scope.layer.search.term !== '';
        if ($scope.layer.search.hasTerm) {
            $scope.layer.search.hasStub = $scope.layer.search.term.length > 2;
            if ($scope.layer.search.hasStub) {
                $scope.layer.search.stub = $scope.layer.search.term.substring(0, 3);
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
}
DestServCtrl.$inject = ['$scope', '$http', '$rootElement'];