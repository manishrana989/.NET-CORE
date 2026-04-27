(function () {
    "use strict";

    angular.module("umbraco").controller("MiembrosListController", function ($http) {
        var vm = this;

        // Initialize members array and search query
        vm.members = [];
        vm.filteredMembers = [];
        vm.searchQuery = "";

        // Fetch members from the API
        vm.fetchMembers = function () {
            $http.get('/umbraco/backoffice/MinisteriosAME/Miembros/GetMembers')
                .then(function (response) {
                    vm.members = response.data.map(member => ({
                        icon: "icon-user",
                        id: member.Id,
                        name: member.Name,
                        email: member.Email
                    }));
                    vm.filteredMembers = vm.members;
                });
        };

        // Initialize controller by fetching members
        vm.fetchMembers();

        // Table options
        vm.options = {
            includeProperties: [
                { alias: "name", header: "Name" },
                { alias: "email", header: "Email" }
            ]
        };

        // Filter members based on search query
        vm.filterMembers = function () {
            vm.filteredMembers = vm.members.filter(member =>
                member.name.toLowerCase().includes(vm.searchQuery.toLowerCase()) ||
                member.email.toLowerCase().includes(vm.searchQuery.toLowerCase())
            );
        };

        // Functions for table interactions
        vm.selectItem = function (selectedItem, $index, $event) {
            alert("Selected member: " + selectedItem.name);
        };

        vm.clickItem = function (item) {
            alert("Clicked member: " + item.name);
        };

        vm.selectAll = function ($event) {
            alert("Select all members");
        };

        vm.isSelectedAll = function () {
            // Implement logic to check if all items are selected
        };

        vm.isSortDirection = function (col, direction) {
            // Implement logic to check sort direction
        };

        vm.sort = function (field, allow, isSystem) {
            // Implement sorting logic
        };
    });
})();
