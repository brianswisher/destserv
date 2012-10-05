'use strict';

(function(){
    var DestServCtrl;
    DestServCtrl = function($scope, $http, $rootElement) {
        $scope.delay = 250;
        $scope.classname = {
            ready: 'ready'
        };
        $scope.nameAttr = 'data-name';
        $scope.defer = function(func,delay){
            delay = delay || $scope.delay;
            return setTimeout(function() {
                func();
            }, delay);
        };
        $scope.$on('refresh', function() {
            $.each( $rootElement, function(i, root) { 
                var containers = $('.'+root.getAttribute('data-destserv-class'),root);
                $.each( containers, function(j, target) {
                    var name = target.getAttribute($scope.nameAttr); 
                    $scope[name].layer.refresh();
                });
            });
        });
        $scope.$on('submit', function() {
            $.each( $rootElement, function(i, root) { 
                var containers = $('.'+root.getAttribute('data-destserv-class'),root);
                $.each( containers, function(j, target) {
                    var name = target.getAttribute($scope.nameAttr); 
                    // $scope[name].layer.refresh();
                });
            });
        });

        $scope.onready = function(name, target) {

            $scope[name] = {
                target: target,
                form: {
                    placeholder: target.getAttribute('data-placeholder'),
                    input: document.forms[target.getAttribute('data-input-form')][target.getAttribute('data-input-name')],
                    update: function(val){
                        $scope[name].form.value = val;
                        $scope[name].form.input.value = val;
                    },
                    submit: function(){
                        var hasGeolocation, errors, hasThem, form;
                        form = $scope[name].form.input.form;
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
                            $scope.$emit('refresh');
                            document.activeElement.blur();
                            return false;
                        }
                        if(hasGeolocation){
                            var self = form,
                                location=$scope[name].form.input,
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
                        $scope.$emit('refresh');
                    }
                },
                layer: {
                    search: {
                        term: '',
                        stub: '',
                        filter: '',
                        placeholder: target.getAttribute('data-placeholder-layer'),
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
                    copy: {
                        cancel: target.getAttribute('data-copy-cancel')
                    },
                    form: document.forms[target.getAttribute('data-layer-form')],
                    state: 'off',
                    position: function(type){
                        var top, field;
                        field = $('.field.location', $scope[name].target);
                        top = field.position().top;
                        if ( type === 'off' ) {
                            $scope.defer(function(){
                                $scope[name].layer.form.style.top = top + 'px'; 
                            },1);
                        } else {
                            $scope.defer(function(){
                                $scope[name].layer.form.style.top = 0;
                                window.scrollTo(0, 0);
                            },1);
                        }
                    },
                    refresh: function(position){
                        if ( position ) {
                            $scope[name].layer.state = position;
                            $scope[name].layer.position(position);
                        } else {
                            if ($scope[name].layer.state === 'off') {
                                $scope[name].layer.position('off');
                            } else {
                                $scope[name].layer.position('on');
                            }
                        }
                    },
                    doFilter: function(){
                        $scope[name].layer.search.hasResults = $scope[name].layer.search.results.raw.length > 0;
                        if ($scope[name].layer.search.hasResults) {
                            $scope[name].layer.search.results.filtered = _.filter($scope[name].layer.search.results.raw, function(city) {
                                return city.v.toLowerCase().indexOf($scope[name].layer.search.filter.toLowerCase()) != -1;
                            });
                            $scope[name].layer.search.results.capped = _.first($scope[name].layer.search.results.filtered, 10);
                        }
                    },
                    submit: function(e) {
                        document.activeElement.blur();
                        $scope[name].layer.state = 'off';
                        $scope[name].form.update($scope[name].layer.search.term);
                        $scope.$emit('refresh');
                        $scope[name].layer.scroll();
                    },
                    doSearch: function(url){
                        clearTimeout($scope[name].layer.search.timeout);
                        if ($scope[name].layer.search.url !== $scope[name].layer.search.urlCached) {
                            $scope[name].layer.search.timeout = $scope.defer(function(){
                                $http.get(url).success(function(data) {
                                    $scope[name].layer.search.results.raw = data;
                                    $scope[name].layer.search.urlCached = url;
                                    $scope[name].layer.search.results.cached = data;
                                });    
                            });
                        } else {
                            $scope[name].layer.search.results.raw = $scope[name].layer.search.results.cached;
                        };
                    },
                    doClear: function(){
                        clearTimeout($scope[name].layer.search.timeout);
                        $scope[name].layer.search.filter = '';
                        $scope[name].layer.search.results.raw = [];
                        $scope[name].layer.search.results.filtered = [];
                        $scope[name].layer.search.results.capped = [];
                    },
                    clickHeader: function(e) {
                        var target = ($scope[name].layer.state === 'off') ? 'show' : e.target.getAttribute('data-ui');
                        switch (target) {
                            case 'cancel':
                                $scope[name].layer.dismiss(e);
                                break;
                            case 'clear':
                                $scope[name].layer.clear(e);
                                break;
                            case 'show':
                                $scope[name].layer.show(e);
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
                                $scope[name].form.update(val);
                                $scope[name].layer.dismiss(e);
                                break;
                            default:
                                document.activeElement.blur();
                        }
                        e.preventDefault();
                        e.stopPropagation();
                    },
                    clear: function(e) {
                        $scope[name].layer.form.field.focus();
                        $scope[name].layer.form.field.value = '';
                        $scope[name].layer.doClear();
                        e.preventDefault();
                        e.stopPropagation();
                    },
                    dismiss: function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        $scope[name].layer.refresh('off');
                        $scope[name].layer.scroll();
                    },
                    show: function(e) {
                        $scope[name].layer.form.field.focus();
                        e.preventDefault();
                        e.stopPropagation();
                        $scope[name].layer.refresh('on');
                    },
                    scroll: function() {
                        $('html, body').animate({
                            scrollTop: $($scope[name].target).offset().top
                        }, $scope.delay);
                    }
                }
            };
            $scope[name].form.update(target.getAttribute('data-value'));
            $scope[name].form.update($scope[name].form.value || $scope[name].form.placeholder);
            $(target).addClass($scope.classname.ready);
            $scope.defer(function(){
                $scope[name].layer.refresh();
            });

            // Watch
            $scope.$watch(name+'.layer.search.term', function() {
                $scope[name].layer.search.hasTerm = $scope[name].layer.search.term !== null && $scope[name].layer.search.term !== '';
                if ($scope[name].layer.search.hasTerm) {
                    $scope[name].layer.search.hasStub = $scope[name].layer.search.term.length > 2;
                    if ($scope[name].layer.search.hasStub) {
                        $scope[name].layer.search.stub = $scope[name].layer.search.term.substring(0, 3);
                        $scope[name].layer.search.hasFilter = $scope[name].layer.search.term.length > 3;
                        if ($scope[name].layer.search.hasFilter) {
                            $scope[name].layer.search.filter = $scope[name].layer.search.term;
                        }
                    } else {
                        $scope[name].layer.search.stub = '';
                    }
                }
            }, true);
            $scope.$watch(name+'.layer.search.stub', function() {
                if ($scope[name].layer.search.stub === '') {
                    $scope[name].layer.search.url = '';
                } else {
                    $scope[name].layer.search.url = 'json/' + $scope[name].layer.search.stub.toLowerCase() + '.json';
                }
            }, true);
            $scope.$watch(name+'.layer.search.filter', function() {
                $scope[name].layer.doFilter();
            }, true);
            $scope.$watch(name+'.layer.search.url', function() {
                if ($scope[name].layer.search.url !== '') {
                    $scope[name].layer.doSearch($scope[name].layer.search.url);
                } else {
                    $scope[name].layer.doClear();
                }
            }, true);
            $scope.$watch(name+'.layer.search.results.raw', function() {
                $scope[name].layer.doFilter();
            }, true);
        }

        $.each( $rootElement, function(i, root) { 
            var containers = $('.'+root.getAttribute('data-destserv-class'),root);
            $.each( containers, function(j, target) {
                var name = target.getAttribute($scope.nameAttr);
                $scope.onready(name,target); 
            });
        });        
    }
    DestServCtrl.$inject = ['$scope', '$http', '$rootElement'];
    window.DestServCtrl = DestServCtrl;
}());