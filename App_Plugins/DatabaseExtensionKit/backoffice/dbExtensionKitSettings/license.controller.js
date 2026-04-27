angular.module("umbraco").controller("licenseController", function ($scope, Upload, fileManager, $http, notificationsService) {
    $scope.licenseInfo = {};

    $scope.fileProperty = {
        editor: "Umbraco.UploadField",
        view: "fileupload",
        config: {
            fileExtensions: [
                {
                    "id": 0,
                    "value": "xml"
                }
            ]
        },
        label: "Upload license",
        alias: "fileLicense",
        labelOnTop:true
    }

    $http({
        method: 'GET',
        url: '/Umbraco/backoffice/DatabaseExtensionKit/Permissions/GetLicenseInfo',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(function (response) {
        $scope.licenseInfo = response.data;
    });



    $scope.upload = function () {
        if (fileManager.getFiles().length > 0) {
            Upload.upload({
                url: "/Umbraco/backoffice/DatabaseExtensionKit/Permissions/UploadLicense",
                file: fileManager.getFiles()
            }).then(function (response) {
                notificationsService.success("Product is activated!");
                $scope.licenseInfo = response.data;

            }, function (response) {
                notificationsService.error(response.data);
            });
        }
    }
});