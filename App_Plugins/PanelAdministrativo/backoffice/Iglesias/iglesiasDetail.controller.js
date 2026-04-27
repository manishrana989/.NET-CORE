(function () {
    "use strict";

    angular.module("umbraco").controller("iglesiasDetailController", function ($scope, $location, $http, $routeParams, notificationsService) {
        var vm = this;

        vm.churchId = $routeParams.id;
        vm.church = {};
        vm.loading = true;
        vm.coordinators = [];

        vm.memberIds = [];

        vm.fetchChurch = function () {
            console.log("Fetching church with ID:", '/umbraco/Church/Iglesias/GetChurchById/' + vm.churchId);
            $http.get('/umbraco/Church/Iglesias/GetChurchById?id=' + vm.churchId)
                .then(function (response) {              
                    console.log("API Response:", response.data);
                    vm.church = response.data;
                    vm.coordinators = vm.church.coordinators ? vm.church.coordinators.split(',') : [];
                    vm.coordinatorEmails = vm.church.coordinatorEmails ? vm.church.coordinatorEmails.split(',') : [];
                    vm.memberIds = vm.church.memberIds || [];
                    vm.church.members = response.data.members || [];
                    console.log("Members Data:", vm.church.members);
                  
                    console.log("Coordinators:", vm.coordinators);
                    console.log("Coordinator Emails:", vm.coordinatorEmails);
                    console.log("Member IDs:", vm.memberIds);

                    vm.loading = false;
                })
                .catch(function (error) {
                    console.error('Error fetching church:', error);
                    notificationsService.error("Error", "Failed to load church data");
                    vm.loading = false;
                });
        };

        vm.clickMember = function (index) {
            // Ensure member is valid before navigating
            if (vm.memberIds && vm.memberIds[index]) {
                var memberId = vm.memberIds[index]; // Get the member ID from the memberIds array
                console.log("Navigating to: /paneladministrativo/miembros/miembroProfile/" + memberId);
                $location.path("/paneladministrativo/miembros/miembroProfile/" + memberId); // Navigate to the profile page
            } else {
                console.error("No member ID found for index:", index);
                console.log("Member IDs:", vm.memberIds); // Log the member IDs for debugging
            }
        };

        vm.fetchChurch();
    });
})();
