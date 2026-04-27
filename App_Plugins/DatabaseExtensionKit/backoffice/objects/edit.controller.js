angular.module("umbraco").controller("editControllerAdmin", function ($scope, $routeParams, overlayService, $http, formHelper, notificationsService, $window, $location, currentUserResource, localizationService) {

    $scope.model = {
        id: $routeParams.id,
        name: '',
        properties: [],
        alias: ''
    };

    $scope.items = [];
    $scope.childObjects = [];

    $scope.properties = []
    $scope.item = $routeParams.item;
    $scope.permissions = {};

    if (angular.isUndefined($scope.item)) {
        $scope.item = 0;
    }


    if ($scope.item > 0 || $scope.item == -1) {

            $http({
                method: 'GET',
                url: '/Umbraco/backoffice/DatabaseExtensionKit/Object/Get?typeId=' + $routeParams.id + '&id=' + $routeParams.item,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                $scope.model.id = $routeParams.id;
                $scope.model.name = response.data.docType.name;
                $scope.model.properties = response.data.docType.groups[0].properties;
                $scope.model.alias = response.data.docType.alias;

  
                $scope.model.properties.forEach(prop => {
                        prop.displayInList = prop.labelOnTop;
                        prop.labelOnTop = false;

                        if ($scope.item != -1) {
                            var pr = response.data.object.properties.find(e => e.alias === prop.alias);
                            prop.value = pr.value;
                        } else {
                            if (prop.alias == $routeParams.col) {
                                prop.value = $routeParams.fk;
                            }
                        }

                    });
                
                $scope.permissions = response.data.objectPermissions;
                $scope.childObjects = response.data.childObjects;


                if ($routeParams.action == "copy") {
                    $scope.item = -1;
                };


            },
                function errorCallback(response) {
                    notificationsService.error(response.data);
                });
        }
    

    $scope.goBack = function () {
            $window.history.back();
    };

    $scope.save = function () {
        $scope.objectForm.$setPristine();
 

        if (formHelper.submitForm({ scope: $scope, formCtrl: $scope.objectForm })) {
            $scope.valid = true;
            var object = $scope.model;
            object.properties.forEach(item => {
                if (item.validation.pattern != null && item.value != null && item.value != '') {
                    var re = new RegExp(item.validation.pattern);
                    if (!re.test(item.value)) {
                        $scope.valid = false;
                        if (item.validation.patternMessage == '') {
                            item.validation.patternMessage = "Invalid property";
                        }

                        notificationsService.error(item.label+": "+item.validation.patternMessage);
                    }
                }
 
            });

            if ($scope.valid) {
                if ($scope.item == -1) {

                    $http({
                        method: 'POST',
                        url: '/Umbraco/backoffice/DatabaseExtensionKit/Object/SaveItem',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        dataType: 'json',
                        data: object
                    }).then(function (response) {
                        localizationService.localize("itemSaved").then(function (value) {
                            notificationsService.success(value);
                        });

                        $scope.items.unshift(response.data);
                        $window.history.back();
                    },
                        function errorCallback(response) {
                            notificationsService.error(response.data);
                        });

                } else {
                    object.id = $scope.item;

                    $http({
                        method: 'POST',
                        url: '/Umbraco/backoffice/DatabaseExtensionKit/Object/UpdateItem',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        dataType: 'json',
                        data: object
                    }).then(function (response) {
                        localizationService.localize("itemSaved").then(function (value) {
                            notificationsService.success(value);
                        });
                        $window.history.back();
                    },
                        function errorCallback(response) {
                            notificationsService.error(response.data);
                        });
                }
            }
        }
    }
   
});