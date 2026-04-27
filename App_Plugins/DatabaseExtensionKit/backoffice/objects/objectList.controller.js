angular.module('umbraco')
    .component('listComponent', {
        templateUrl: '/App_Plugins/DatabaseExtensionKit/backoffice/objects/objectList.html',

        controller: function GroupController($scope, $http, overlayService, $location, $routeParams, notificationsService, localizationService, $route, $window, $filter, Upload) {
            this.$onInit = function () {
                $scope.recordsPerPage = 10;
                $scope.pagination = {};
                $scope.permissions = {};
                $scope.fk = $routeParams.item;

                $scope.seassionSearch = Utilities.fromJson($window.sessionStorage.getItem($routeParams.id + "_" + $routeParams.item));

                if ($scope.seassionSearch == null && angular.isUndefined($routeParams.item)) {
                    $window.sessionStorage.clear();
                }

                $scope.searchText = $scope.seassionSearch != null ? $scope.seassionSearch.parameter : '';
                $scope.isChildrenList = $scope.ListCtrl.childrenList == 1;

                $scope.sortColumn = $scope.seassionSearch != null ? $scope.seassionSearch.sortCol : 'Id';
                $scope.sortOrder = $scope.seassionSearch != null ? $scope.seassionSearch.sortOrder : 'desc';
                $scope.offset = $scope.seassionSearch != null ? $scope.seassionSearch.offset : 0;
                $scope.filters = $scope.seassionSearch != null ? $scope.seassionSearch.filters : [];
                $scope.showFilters = false;
                $scope.filtersButtonKey = "general_showFilters";

                getContent($scope.offset, $scope.recordsPerPage, $scope.searchText, $scope.sortColumn, $scope.sortOrder, true);
                $scope.sortingMode = false;
            }

            $scope.clearDirty = function () {
                $scope.filterForm.$setPristine();
                $scope.filterForm.$$parentForm.$setPristine();
            };

            $scope.cancelSort = function () {
                $scope.sortingMode = false;
                $scope.sortableOptions.disabled = true
                $route.reload();
            }

            $scope.openSortMode = function () {
                $scope.sortingMode = true;
                $scope.sortableOptions.disabled = false
            }

            $scope.saveSort = function () {

                $http({
                    method: 'POST',
                    url: '/Umbraco/backoffice/DatabaseExtensionKit/Object/SortObjects',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    dataType: 'json',
                    data: { table: $scope.ListCtrl.model.alias, objects: $scope.ListCtrl.items }
                }).then(function (response) {

                }, function (response) {
                    notificationsService.error(response.data);
                });
                $scope.sortingMode = false;
                $scope.sortableOptions.disabled = true;
                $route.reload();
            }

            $scope.sortableOptions = {
                axis: "y",
                containment: "parent",
                distance: 10,
                tolerance: "pointer",
                opacity: 0.7,
                scroll: true,
                cursor: "move",
                stop: function () {
                    reorder();
                },
                disabled: true
            }

            function reorder() {
                $scope.ListCtrl.items.forEach(
                    (element, index) => {
                        element.sortOrder = index + $scope.minSort;
                    });
            };

            localizationService.localize("delete").then(function (value) {
                $scope.deleteTxt = value;
            });

            localizationService.localize("defaultdialogs_confirmdelete").then(function (value) {
                $scope.confirmDeleteTxt = value;
            });

            $scope.toggleFiltersMode = () => {

                if ($scope.showFilters === false) {

                    $scope.showFilters = true;
                    $scope.filtersButtonKey = "general_hideFilters";

                } else {
                    $scope.showFilters = false;
                    $scope.filtersButtonKey = "general_showFilters";
                }

            };


            $scope.delete = function (item) {
                overlayService.confirmDelete({
                    title: $scope.deleteTxt,
                    content: $scope.confirmDeleteTxt + ": Id " + item.id + "?",
                    disableBackdropClick: true,
                    disableEscKey: true,
                    submit: function () {

                        $http.delete("/Umbraco/backoffice/DatabaseExtensionKit/Object/DeleteItem", {
                            params: {
                                name: $scope.ListCtrl.model.alias,
                                id: item.id
                            }
                        })
                            .then(function successCallback(response) {
                            },
                                function errorCallback(response) {
                                    notificationsService.error(response.data);
                                });

                        var index = $scope.ListCtrl.items.indexOf(item);
                        $scope.ListCtrl.items.splice(index, 1);
                        overlayService.close();
                    }
                });
            };
            $scope.sort = function (column) {
                if ($scope.sortColumn == column) {
                    if ($scope.sortOrder == 'asc') {
                        $scope.sortOrder = 'desc';
                    }
                    else {
                        $scope.sortOrder = 'asc';
                    }
                } else {
                    $scope.sortColumn = column;
                    $scope.sortOrder = 'asc';
                }
                getContent(0, $scope.recordsPerPage, $scope.searchText, $scope.sortColumn, $scope.sortOrder);

            }

            $scope.checkSortOrder = function (name) {
                if ($scope.sortColumn == name)
                    return $scope.sortOrder;
                return "";

            }

            $scope.searchPlaceholder = '';
            localizationService.localize("typeToSearch").then(function (value) {
                $scope.searchPlaceholder = value;
            });


            $scope.copy = function (item) {
                $location
                    .path("/dbExtensionKit/objects/edit/" + $scope.ListCtrl.model.id).
                    search({ item: item.id, action: "copy" })

            };
            $scope.nextPage = function (pageNumber) {
                var offset = (pageNumber - 1) * $scope.recordsPerPage;
                getContent(offset, $scope.recordsPerPage, $scope.searchText, $scope.sortColumn, $scope.sortOrder)
            }

            $scope.prevPage = function (pageNumber) {
                var offset = (pageNumber - 1) * $scope.recordsPerPage;
                getContent(offset, $scope.recordsPerPage, $scope.searchText, $scope.sortColumn, $scope.sortOrder)
            }

            $scope.changePage = function (pageNumber) {
                var offset = (pageNumber - 1) * $scope.recordsPerPage;
                getContent(offset, $scope.recordsPerPage, $scope.searchText, $scope.sortColumn, $scope.sortOrder)
            }

            $scope.goToPage = function (pageNumber) {
                var offset = (pageNumber - 1) * $scope.recordsPerPage;
                getContent(offset, $scope.recordsPerPage, $scope.searchText, $scope.sortColumn, $scope.sortOrder)
            }

            $scope.search = function (filter) {
                $scope.searchText = filter;
                getContent(0, $scope.recordsPerPage, filter, "", "");
            }

            $scope.create = function () {
                if ($scope.isChildrenList) {
                    $location
                        .path("/dbExtensionKit/objects/edit/" + $scope.ListCtrl.model.id).
                        search({ item: '-1', col: $scope.ListCtrl.reference.colName, fk: $scope.fk });
                } else {
                    $location
                        .path("/dbExtensionKit/objects/edit/" + $scope.ListCtrl.model.id).
                        search({ item: '-1' });
                }
            }

            $scope.filterResult = function () {
                getContent(0, $scope.recordsPerPage, $scope.searchText, '', '');
                $scope.filterForm.$setPristine();
                $scope.filterForm.$$parentForm.$setPristine();
            }

            $scope.exportCsv = function () {

                var id = $routeParams.id;
                if ($scope.isChildrenList)
                    id = $scope.ListCtrl.model.id;

                var colName = "";
                if (!angular.isUndefined($scope.ListCtrl.reference))
                    colName = $scope.ListCtrl.reference.colName;

                $scope.searchData = {
                    id: id,
                    offset: 0,
                    limit: 0,
                    parameter: $scope.searchText,
                    fkCol: colName,
                    fk: $scope.fk,
                    sortCol: $scope.sortColumn,
                    sortOrder: $scope.sortOrder,
                    filters: $scope.filters
                }

                $http({
                    method: 'POST',
                    url: '/Umbraco/backoffice/DatabaseExtensionKit/Csv/Export',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    dataType: 'json',
                    data: $scope.searchData,
                    responseType: 'arraybuffer'
                }).then(function (response) {
                    var file = new Blob([response.data], {
                        type: response.headers('Content-Type')
                    });
                    //trick to download store a file having its URL
                    var fileURL = URL.createObjectURL(file);
                    var a = document.createElement('a');
                    a.href = fileURL;
                    a.target = '_blank';
                    a.download = getFileName($scope.ListCtrl.model.name);
                    document.body.appendChild(a); //create the link "a"
                    a.click(); //click the link "a"
                    document.body.removeChild(a); //remove the link "a"
                });
            }

            function getFileName(objectName) {
                let d = new Date();
                let dformat = $filter('date')(d, 'yyyyMMdd_hhmmss');

                return objectName + "_" + dformat + ".csv";
            }


            function getContent(offset, limit, parameter, sortColumn, sortOrder, firstLoad = false) {
                if (angular.isUndefined($routeParams.item) || $scope.isChildrenList) {

                    $scope.viewLoaded = false;

                    var id = $routeParams.id;
                    if ($scope.isChildrenList)
                        id = $scope.ListCtrl.model.id;

                    var colName = "";
                    if (!angular.isUndefined($scope.ListCtrl.reference))
                        colName = $scope.ListCtrl.reference.colName;

                    $scope.searchData = {
                        id: id,
                        offset: offset,
                        limit: limit,
                        parameter: parameter,
                        fkCol: colName,
                        fk: $scope.fk,
                        sortCol: sortColumn,
                        sortOrder: sortOrder,
                        filters: $scope.filters
                    }

                    $http({
                        method: 'POST',
                        url: '/Umbraco/backoffice/DatabaseExtensionKit/Object/GetContent',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        dataType: 'json',
                        data: $scope.searchData
                    }).then(function (response) {
                        $scope.ListCtrl.items = response.data.objects;
                        var totalPages = Math.ceil(response.data.totalRecords / limit);

                        $scope.minSort = Math.min.apply(Math, response.data.objects.map(function (item) { return item.sortOrder; }));

                        $scope.ListCtrl.model.name = response.data.docType.name;
                        $scope.ListCtrl.model.properties = response.data.docType.groups[0].properties;
                        $scope.ListCtrl.model.alias = response.data.docType.alias;
                        $scope.ListCtrl.model.properties.forEach(prop => {
                            prop.displayInList = prop.labelOnTop;
                            prop.labelOnTop = false;
                        })

                        if (firstLoad && $scope.seassionSearch == null) {
                            $scope.filters = response.data.filters;
                            $scope.searchData.filters = response.data.filters;
                        }

                        $scope.ListCtrl.permissions = response.data.objectPermissions;

                        $scope.pagination = {
                            pageNumber: (offset / $scope.recordsPerPage) + 1,
                            totalPages: totalPages
                        };
                        $scope.viewLoaded = true;

                        $window.sessionStorage.setItem($routeParams.id + "_" + $routeParams.item, Utilities.toJson($scope.searchData));
                    },
                        function errorCallback(response) {
                            $scope.viewLoaded = true;
                            notificationsService.error(response.data);
                        });



                }
            }

        },
        controllerAs: 'ListCtrl',
        bindings: {
            model: '<',
            items: '<',
            search: '<',
            permissions: '<',
            reference: '<',
            childrenList: '<'
        }
    });