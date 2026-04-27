(function () {
    "use strict";

    angular.module("umbraco").controller("MiembrosController", function ($http, $location) {
        var vm = this;

        vm.members = [];
        vm.filteredMembers = [];
        vm.searchQuery = "";
        vm.content = {
            totalMembers: 0,
            usaCount: 0,
            prCount: 0,
            drCount: 0,
            description: "Description placeholder",
            totalBautizado: 0,
            totalAmigo: 0,
            totalCoordinators: 0,
            totalDependents: 0,
            totalMinors: 0,
            totalSustaining: 0
        };

        vm.fetchMembers = function () {
            $http.get('/umbraco/backoffice/PanelAdministrativo/Miembros/GetMembers')
                .then(function (response) { 
                    vm.members = response.data.Members.map(member => ({
                        icon: "icon-user",
                        id: member.Id,
                        name: member.Name,
                        email: member.Email,
                        isCoordinator: member.MemberIsCoordinator,
                        bautizado: member.Bautizado,
                        amigo: member.Amigo,
                        memberType: member.MemberType
                    }));
                    vm.filteredMembers = vm.members;
                    console.log("Fetching result with ID:", response.data);
                    // Update stats
                    vm.content.totalMembers = response.data.TotalMembers;
                    vm.content.totalBautizado = response.data.TotalBautizado;
                    vm.content.totalAmigo = response.data.TotalAmigo;
                    vm.content.totalCoordinators = response.data.TotalCoordinators;
                    vm.content.totalDependents = response.data.TotalDependents;
                    vm.content.totalMinors = response.data.TotalMinors;
                    vm.content.totalSustaining = response.data.TotalSustaining;
                    vm.content.usaCount = response.data.TotalUSA;
                    vm.content.prCount = response.data.TotalPR;
                    vm.content.drCount = response.data.TotalDR;
                    console.log("vm.content data: ", vm.content);
                })
                .catch(function (error) {
                    console.error('Error fetching members:', error);
                });
        };

        //get members.
        vm.fetchMembers();

        vm.options = {
            includeProperties: [
                { alias: "name", header: "Name" },
                { alias: "email", header: "Email" }
            ]
        };

        vm.filterMembers = function () {
            vm.filteredMembers = vm.members.filter(member =>
                member.name.toLowerCase().includes(vm.searchQuery.toLowerCase()) ||
                member.email.toLowerCase().includes(vm.searchQuery.toLowerCase())
            );
        };

        vm.selectItem = function (selectedItem, $index, $event) {
            console.log("Selected member:", selectedItem.name);
        }; 

        vm.clickItem = function (item) {
            console.log("clickItem function called");
            console.log("Clicked item:", item);
            if (item && item.id) {
                console.log("Navigating to: /paneladministrativo/miembros/miembroProfile/" + item.id);
                $location.path("/paneladministrativo/miembros/miembroprofile/" + item.id);
            } else {
                console.error("Clicked item is undefined or doesn't have an id property");
            }
        };

        vm.selectAll = function ($event) {
            console.log("Select all members");
        };

        vm.isSelectedAll = function () {
            return vm.filteredMembers.length > 0 && vm.filteredMembers.every(m => m.selected);
        };

        vm.isSortDirection = function (col, direction) {
            // Implement logic to check sort direction
            return false;
        };

        vm.sort = function (field, allow, isSystem) {
            vm.filteredMembers.sort((a, b) => a[field].localeCompare(b[field]));
        };
    });
})();