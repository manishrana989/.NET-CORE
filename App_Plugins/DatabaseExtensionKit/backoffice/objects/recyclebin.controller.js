angular.module("umbraco").controller("RecycleBinController", function ($scope, $http, contentTypeResource, notificationsService, localizationService, overlayService) {
    $scope.types = [];
    $scope.recordsPerPage = 10;
    $scope.table = '';
    $scope.model = {};
    $scope.items = [];
    $scope.pagination = {};
    $scope.searchText = '';

    contentTypeResource.getAll().then(function (data) {
        $scope.types = data.filter(function (item) {
            return (item.alias.indexOf("ObjectOmni") !== -1);
        });
    });

    localizationService.localize("delete").then(function (value) {
        $scope.deleteTxt = value;
    });

    localizationService.localize("defaultdialogs_confirmdelete").then(function (value) {
        $scope.confirmDeleteTxt = value;
    });

    localizationService.localize("actions_restore").then(function (value) {
        $scope.restoreTxt = value;
    });

    localizationService.localize("defaultdialogs_confirmrestore").then(function (value) {
        $scope.confirmRestoreTxt = value;
    });

    localizationService.localize("deleteall").then(function (value) {
        $scope.deleteAllTxt = value;
    });

    localizationService.localize("defaultdialogs_confirmdeleteall").then(function (value) {
        $scope.confirmDeleteAllTxt = value;
    });
    $scope.delete = function (item) {
        overlayService.confirmDelete({
            title: $scope.deleteTxt,
            content: $scope.confirmDeleteTxt + ": Id " + item.id + "?",
            disableBackdropClick: true,
            disableEscKey: true,
            submit: function () {

                $http.delete("/Umbraco/backoffice/DatabaseExtensionKit/Object/DeleteFromRecycle", {
                    params: {
                        name: $scope.table,
                        id: item.id
                    }
                })
                    .then(function successCallback(response) {

                        var index = $scope.items.indexOf(item);
                        $scope.items.splice(index, 1);
                    },
                        function errorCallback(response) {
                            notificationsService.error(response.data);
                        });

                overlayService.close();
            }
        });
    };

    $scope.restore = function (item) {
        overlayService.confirm({
            title: $scope.restoreTxt,
            content: $scope.confirmRestoreTxt + ": Id " + item.id + "?",
            disableBackdropClick: true,
            disableEscKey: true,
            submit: function () {

                $http.delete("/Umbraco/backoffice/DatabaseExtensionKit/Object/RestoreItem", {
                    params: {
                        name: $scope.table,
                        id: item.id
                    }
                })
                    .then(function successCallback(response) {
                        var index = $scope.items.indexOf(item);
                        $scope.items.splice(index, 1);
                    },
                        function errorCallback(response) {
                            notificationsService.error(response.data);
                        });


                overlayService.close();
            }
        });
    };

    $scope.deleteAll = function () {
        overlayService.confirmDelete({
            title: $scope.deleteAllTxt,
            content: $scope.confirmDeleteAllTxt + "?",
            disableBackdropClick: true,
            disableEscKey: true,
            submit: function () {

                $http.delete("/Umbraco/backoffice/DatabaseExtensionKit/Object/DeleteAll", {
                    params: {
                        name: $scope.table,
                    }
                })
                    .then(function successCallback(response)
                    {
                        getContent(0, $scope.recordsPerPage, '');
                    },
                        function errorCallback(response) {
                            notificationsService.error(response.data);
                        });

                overlayService.close();
            }
        });
    };

    $scope.searchPlaceholder = '';
    localizationService.localize("typeToSearch").then(function (value) {
        $scope.searchPlaceholder = value;
    });


    $scope.loadTable = function() {
        $scope.table = this.selectedObject;
        getContent(0, $scope.recordsPerPage, '');
    }

    $scope.searchDeleted = function (filter) {
        $scope.searchText = filter;
        getContent(0, $scope.recordsPerPage, filter, "", "");
    }

    $scope.nextPage = function (pageNumber) {
        var offset = (pageNumber - 1) * $scope.recordsPerPage;
        getContent(offset, $scope.recordsPerPage, $scope.searchText)
    }

    $scope.prevPage = function (pageNumber) {
        var offset = (pageNumber - 1) * $scope.recordsPerPage;
        getContent(offset, $scope.recordsPerPage, $scope.searchText)
    }

    $scope.changePage = function (pageNumber) {
        var offset = (pageNumber - 1) * $scope.recordsPerPage;
        getContent(offset, $scope.recordsPerPage, $scope.searchText)
    }

    $scope.goToPage = function (pageNumber) {
        var offset = (pageNumber - 1) * $scope.recordsPerPage;
        getContent(offset, $scope.recordsPerPage, $scope.searchText)
    }

    function getContent(offset, limit, parameter) {
            $scope.viewLoaded = false;

            $http({
                method: 'GET',
                url: '/Umbraco/backoffice/DatabaseExtensionKit/Object/GetDeleted?alias=' + $scope.table + '&offset=' + offset + '&limit=' + limit + '&parameter=' + parameter,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                $scope.items = response.data.objects;
                var totalPages = Math.ceil(response.data.totalRecords / limit);

                $scope.model.name = response.data.docType.name;
                $scope.model.properties = response.data.docType.groups[0].properties;
                $scope.model.alias = response.data.docType.alias;
                $scope.model.properties.forEach(prop => {
                    prop.displayInList = prop.labelOnTop;
                    prop.labelOnTop = false;
                })

                $scope.pagination = {
                    pageNumber: (offset / $scope.recordsPerPage) + 1,
                    totalPages: totalPages
                };
                $scope.viewLoaded = true;
            },
                function errorCallback(response) {
                    $scope.viewLoaded = true;
                    notificationsService.error(response.data);
                });



        
    }
})