(function () {
    "use strict";

    angular.module("umbraco").controller("funerariasController", function ($http, $location) {
        var vm = this;

        vm.allHomes = []; // Store all homes
        vm.filteredhomes = []; // Store filtered homes
        vm.searchQuery = "";
        vm.content = {
            title: "Funeral Homes",
            description: "Manage your funeral homes here."
        };

        vm.fetchFuneralHomes = function () {
            $http.get('/umbraco/Funeral/FuneralHomes/GetFuneralHomes')
                .then(function (response) {
                    vm.allHomes = response.data.map(home => ({
                        id: home.id,
                        name: home.name,
                        contract: home.contract,
                        phoneNumber: home.phoneNumber,
                        emailAddress: home.emailAddress,
                        priceForService: home.priceForService,
                        directorName: home.directorName,
                        funeralHomeOwnerName: home.funeralHomeOwnerName
                    }));
                    vm.filteredhomes = vm.allHomes; // Initialize filtered homes
                    console.log("Fetched funeral homes:", vm.allHomes);
                    vm.filterHomes(); // Initial filtering
                })
                .catch(function (error) {
                    console.error('Error fetching funeral homes:', error);
                });
        };

        vm.fetchFuneralHomes();

        vm.filterHomes = function () {
            const searchQuery = vm.searchQuery ? vm.searchQuery.toLowerCase().trim() : '';
            console.log("Searching for:", searchQuery); // Log the search query

            vm.filteredhomes = vm.allHomes.filter(home => {
                return (
                    home.name.toLowerCase().includes(searchQuery) ||
                    home.phoneNumber.toLowerCase().includes(searchQuery) ||
                    home.emailAddress.toLowerCase().includes(searchQuery) ||
                    home.contract.toLowerCase().includes(searchQuery) ||
                    home.directorName.toLowerCase().includes(searchQuery) ||
                    home.funeralHomeOwnerName.toLowerCase().includes(searchQuery)
                );
            });

            console.log("Filtered homes:", vm.filteredhomes); // Log the filtered results
        };

        vm.clickItem = function (item) {
            if (item && item.id) {
                console.log("Navigating to: /paneladministrativo/funerarias/funerariasDetail/" + item.id);
                $location.path("/paneladministrativo/funerarias/funerariasDetail/" + item.id);
            } else {
                console.error("Clicked item is undefined or doesn't have an id property");
            }
        };

        vm.AddProfileclickItem = function () {
            $location.path("/paneladministrativo/Funerarias/funerariasAddProfile/");
        };

        vm.editProfileclickItem = function (item) {
            $location.path("/paneladministrativo/Funerarias/funerariasAddProfile/" + item.id);
        };

        vm.deletefuneralhome = function (funeralhome) {
            if (confirm("Are you sure you want to delete this funeral home?")) {
                $http.delete('/umbraco/Funeral/FuneralHomes/DeleteFuneralHome/' + funeralhome.id)
                    .then(function (response) {
                        vm.filteredhomes = vm.filteredhomes.filter(h => h.id !== funeralhome.id);
                        console.log("Funeral home deleted successfully");
                    })
                    .catch(function (error) {
                        console.error('Error deleting funeral home:', error);
                    });
            }
        };
    });
})();
