angular.module("umbraco").controller("importController", function ($scope, navigationService, Upload, fileManager, notificationsService) {
    $scope.fileProperty = {
        editor: "Umbraco.UploadField",
        view: "fileupload",
        config: {
            fileExtensions: [
                {
                    "id": 0,
                    "value": "csv"
                }
            ]
        },
        label: "Select csv file",
        alias: "fileCsv",
        labelOnTop: true
    }


    $scope.importCsv = function () {
        Upload.upload({
            url: "/Umbraco/backoffice/DatabaseExtensionKit/Csv/Import",
            file: fileManager.getFiles(),
            fields: {
                'object': $scope.currentNode.id
            },
        }).then(function (response) {
            notificationsService.success("Import success");
            $scope.fileProperty.value = null;
        }, function (response) {
            notificationsService.error(response.data);
            $scope.fileProperty.value = null;
        });
    }
        

    $scope.cancel = function () {
        navigationService.hideDialog();
        $scope.fileProperty.value = null;
    }
});