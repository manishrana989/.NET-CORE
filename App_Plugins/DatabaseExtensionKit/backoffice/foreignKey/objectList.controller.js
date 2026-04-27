angular.module("umbraco").controller("ObjectListController", function ($scope, $http, contentTypeResource, $routeParams) {
    $scope.types = [];

    contentTypeResource.getAll().then(function (data) {
        $scope.types = data.filter(function (item) {
            return (item.alias.indexOf("ObjectOmni") !== -1 && item.id != $routeParams.id);
        });


    });
});