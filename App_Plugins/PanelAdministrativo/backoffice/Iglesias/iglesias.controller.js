(function () {
    "use strict";

    angular.module("umbraco").controller("IglesiasController", function ($http, $location) {
        var vmIglesia = this;

        vmIglesia.churches = [];
        vmIglesia.filteredChurches = [];
        vmIglesia.searchQuery = "";
        vmIglesia.content = {
            totalChurches: 0,
            totalActive: 0,
            totalInactive: 0,
            totalSmall: 0,
            totalMedium: 0,
            totalLarge: 0,
            totalNorth: 0,
            totalSouth: 0,
            totalCentral: 0,
            description: "Church description placeholder"
        };


        vmIglesia.fetchChurches = function () {
            $http.get('/umbraco/Church/Iglesias/GetChurches')
                .then(function (response) {
           
                    vmIglesia.churches = response.data.map(church => ({
                        icon: "icon-church",
                        id: church.id,
                        name: church.name,
                        address: church.address,
                        phoneNumber: church.phoneNumber,
                        emailAddress: church.emailAddress,
                        coordinatorName: church.coordinatorName,
                        createdDate: church.createdDate,
                        status: church.status 
                    }));
                    vmIglesia.filteredChurches = vmIglesia.churches;

                    updateStatistics();
                    console.log("vmIglesia.content data: ", vmIglesia.content);
                })
                .catch(function (error) {
                    console.error('Error fetching churches:', error);
                });
        };

        vmIglesia.fetchChurches();

        function updateStatistics() {
            vmIglesia.content.totalChurches = vmIglesia.churches.length;
            vmIglesia.content.totalActive = vmIglesia.churches.filter(ch => ch.status === 'Active').length;
            vmIglesia.content.totalInactive = vmIglesia.churches.filter(ch => ch.status === 'Inactive').length;
   
        }

        vmIglesia.filterChurches = function () {
            const searchQuery = vmIglesia.searchQuery ? vmIglesia.searchQuery.toLowerCase().trim() : '';

            vmIglesia.filteredChurches = vmIglesia.churches.filter(church => {
                return (
                    church.name.toLowerCase().includes(searchQuery) ||
                    church.phoneNumber.toLowerCase().includes(searchQuery) ||
                    church.emailAddress.toLowerCase().includes(searchQuery) ||
                    church.address.toLowerCase().includes(searchQuery) ||
                    church.coordinatorName.toLowerCase().includes(searchQuery) ||
                    (church.createdDate && church.createdDate.toLowerCase().includes(searchQuery)) 
                );
            });
        };

        vmIglesia.clickItem = function (item) {
            if (item && item.id) {
                console.log("Navigating to: /paneladministrativo/iglesias/iglesiasDetail/" + item.id);
                $location.path("/paneladministrativo/iglesias/iglesiasDetail/" + item.id);
            } else {
                console.error("Clicked item is undefined or doesn't have an id property");
            }
        };

        vmIglesia.AddProfileclickItem = function () {
            $location.path("/paneladministrativo/iglesias/iglesiasAddProfile/");
        };

        vmIglesia.editProfileclickItem = function (item) {
            $location.path("/paneladministrativo/iglesias/iglesiasAddProfile/" + item.id);
        };

        vmIglesia.deleteChurch = function (church) {
            if (confirm("Are you sure you want to delete this church?")) {
                $http.delete('/umbraco/Church/Iglesias/DeleteChurch/' + church.id)
                    .then(function (response) {
                        vmIglesia.churches = vmIglesia.churches.filter(c => c.id !== church.id);
                        vmIglesia.filteredChurches = vmIglesia.filteredChurches.filter(c => c.id !== church.id);
                        updateStatistics();
                        console.log("Church deleted successfully");
                    })
                    .catch(function (error) {
                        console.error('Error deleting church:', error);
                    });
            }
        };
    });
})();
