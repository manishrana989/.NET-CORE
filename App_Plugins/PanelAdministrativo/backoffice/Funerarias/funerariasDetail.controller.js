(function () {
    "use strict";

    angular.module("umbraco").controller("funerariasDetailController", function ($scope, $http, $routeParams, $location, notificationsService) {
        var vm = this;

        vm.funeralHomeId = $routeParams.id;
        vm.funeralHome = {};
        vm.loading = true;


        vm.fetchFuneralHome = function () {
            console.log("Fetching funeral home with ID:", '/umbraco/Funeral/FuneralHomes/GetFuneralHomeById/' + vm.funeralHomeId);
            $http.get('/umbraco/Funeral/FuneralHomes/GetFuneralHomeById?id=' + vm.funeralHomeId)
                .then(function (response) {
                    vm.funeralHome = response.data;
                    vm.loading = false;
                })
                .catch(function (error) {
                    console.error('Error fetching funeral home:', error);
                    notificationsService.error("Error", "Failed to load funeral home data");
                    vm.loading = false;
                });
        };

        vm.fetchFuneralHomes = function () {
            $http.get('/umbraco/Funeral/FuneralHomes/GetFuneralHomes')
                .then(function (response) {
                    console.log("All funeral homes data:", response.data);
                    vm.funerals = response.data.map(home => ({
                        icon: "icon-funeral-home",
                        id: home.id,
                        name: home.name,
                        directorName: home.directorName
                    }));
                    vm.filteredHomes = vm.funerals.filter(home => home.id !== parseInt(vm.funeralHomeId));
                })
                .catch(function (error) {
                    console.error('Error fetching funeral homes:', error);
                });
        };
        vm.clickItem = function (item) {
            if (item && item.id) {
                console.log("Navigating to: /paneladministrativo/funerarias/funerariasDetail/" + item.id);
                $location.path("/paneladministrativo/funerarias/funerariasDetail/" + item.id);
            } else {
                console.error("Clicked item is undefined or doesn't have an id property");
            }
        };

        // Initialize data
        vm.fetchFuneralHome();
        vm.fetchFuneralHomes();
    });
})();
