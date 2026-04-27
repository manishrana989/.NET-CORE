(function () {
    "use strict";

    angular.module("umbraco").controller("MiembroProfileController", function ($scope, $http, $routeParams, notificationsService) {
        var vm = this;

        vm.memberId = $routeParams.id;
        vm.member = {};
        vm.loading = true;

      

        vm.fetchMember = function () {
            vm.loading = true;
            console.log("Fetching member with ID:", vm.memberId);
            $http.get('/umbraco/backoffice/PanelAdministrativo/Miembros/GetMember?id=' + vm.memberId)
                .then(function (response) {
               
                    vm.member = response.data;
                    console.log(vm.member);
                    vm.loading = false;
                })
                .catch(function (error) {
                    console.error('Error fetching member:', error);
                    notificationsService.error("Error", "Failed to load member data");
                    vm.loading = false;
                });
        };

        vm.save = function () {
            vm.loading = true;
            $http.post('/umbraco/backoffice/PanelAdministrativo/Miembros/SaveMember', vm.member)
                .then(function (response) {
                    notificationsService.success("Success", "Member data saved successfully");
                    vm.loading = false;
                })
                .catch(function (error) {
                    console.error('Error saving member:', error);
                    notificationsService.error("Error", "Failed to save member data");
                    vm.loading = false;
                });
        };

        // Initialize
        vm.fetchMember();
    });
})();