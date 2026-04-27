angular.module("umbraco").controller("deleteController", function ($scope, navigationService, treeService, contentTypeResource, $http, notificationsService, historyService) {

    $scope.buttonState = "init";

    $scope.onDelete = function () {
        $scope.buttonState = "busy";

            
        $http.delete("/Umbraco/backoffice/DatabaseExtensionKit/ObjectType/Delete", {
            params: {
                id: $scope.currentNode.id
            }
        })
            .then(function successCallback(response) {
                treeService.removeNode($scope.currentNode);
                contentTypeResource.deleteById($scope.currentNode.id)

                var objectManagerItem = historyService.getLastAccessedItemForSection("dbExtensionKit");
                var objectManagerAdminItem = historyService.getLastAccessedItemForSection("dbExtensionKitAdmin");

                if (objectManagerItem != null && objectManagerItem.name == $scope.currentNode.name) {
                    historyService.remove(objectManagerItem);
                }

                if (objectManagerAdminItem != null && objectManagerAdminItem.name == $scope.currentNode.name) {
                    historyService.remove(objectManagerAdminItem);
                }

            },
                function errorCallback(response) {
                    notificationsService.error(response.data);
                });


        navigationService.hideDialog();
        $scope.buttonState = "success";

        treeService.clearCache();
    };

    $scope.onCancel = function () {
        navigationService.hideDialog();
    }
});