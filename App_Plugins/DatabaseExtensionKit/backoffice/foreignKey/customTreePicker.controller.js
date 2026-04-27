angular.module("umbraco").controller("CustomTreePickerController", function ($scope,
    $http) {

    var vm = this;
    $scope.recordsPerPage = 10;
    $scope.pagination = {};

    function getContent(offset, limit, parameter) {
        $http({
            method: 'GET',
            url: '/Umbraco/backoffice/DatabaseExtensionKit/Object/GetForeignKeyObjects?table=' + $scope.model.entityType+ '&offset=' + offset + '&limit=' + limit + '&parameter=' + parameter,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (response) {
            vm.nodes = response.data.objects;
            var totalPages = Math.ceil(response.data.totalRecords / limit);

            $scope.pagination = {
                pageNumber: (offset / $scope.recordsPerPage) + 1,
                totalPages: totalPages
            };
        });
    }

    vm.close = close;
    vm.selectNode = selectNode;
    vm.nextPage = nextPage;
    vm.prevPage = prevPage;
    vm.changePage = changePage;
    vm.goToPage = goToPage;
    vm.search = search;

    vm.title= "Select entity"

    $scope.model.selection = [];
    $scope.searchText = "";

    function selectNode(node) {
        $scope.model.selection.push(node);
        $scope.model.submit($scope.model);
    }

    function close() {
        if ($scope.model.close) {
            $scope.model.close();
        }
    }
    function nextPage(pageNumber) {
        var offset = (pageNumber - 1) * $scope.recordsPerPage;
        getContent(offset, $scope.recordsPerPage, $scope.searchText)
    }

    function prevPage(pageNumber) {
        var offset = (pageNumber - 1) * $scope.recordsPerPage;
        getContent(offset, $scope.recordsPerPage, $scope.searchText)
    }

    function changePage(pageNumber) {
        var offset = (pageNumber - 1) * $scope.recordsPerPage;
        getContent(offset, $scope.recordsPerPage, $scope.searchText)
    }

    function goToPage(pageNumber) {
        var offset = (pageNumber - 1) * $scope.recordsPerPage;
        getContent(offset, $scope.recordsPerPage, $scope.searchText)
    }

    function search(filter) {
        $scope.searchText = filter;
        getContent(0, $scope.recordsPerPage, filter);
    }

    getContent(0, $scope.recordsPerPage, "");
 
});