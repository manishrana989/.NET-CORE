angular.module('umbraco').controller('funeralHomeAddProfileController', function ($http, $scope, notificationsService, $routeParams) {
    var vm = this;
    vm.loading = false;
    vm.originalFuneralHome = {};
    vm.funeralHome = {};
    vm.members = [];
    vm.memberId = null;
    vm.isEdit = false;
    vm.funeralHomeId = $routeParams.id || null;

    
    vm.fetchMembers = function () {
        vm.loading = true;
        $http.get('/umbraco/backoffice/PanelAdministrativo/Miembros/GetMembers')
            .then(function (response) {
                
                vm.members = response.data.SupportedMembers.map(member => ({
                    id: member.Id,
                    name: member.Name
                }));
            })
            .catch(function (error) {
                console.error('Error fetching members:', error);
                notificationsService.error("Error", "Failed to load members data");
            })
            .finally(function () {
                vm.loading = false;
            });
    };

 
    vm.fetchFuneralHomeDetails = function () {
        if (vm.funeralHomeId) {
            vm.isEdit = true; 
            vm.loading = true;
            $http.get('/umbraco/Funeral/FuneralHomes/GetFuneralHomeById/' + vm.funeralHomeId)
                .then(function (response) {
                    vm.funeralHome = response.data;
                    vm.originalFuneralHome = angular.copy(vm.funeralHome);
                    vm.memberId = vm.funeralHome.MemberId;
                })
                .catch(function (error) {
                    console.error('Error fetching funeral home details:', error);
                    notificationsService.error("Error", "Failed to load funeral home data");
                })
                .finally(function () {
                    vm.loading = false;
                });
        }
    };

    
    vm.checkForChanges = function () {
        vm.hasChanges = !angular.equals(vm.funeralHome, vm.originalFuneralHome) || vm.memberId !== vm.originalFuneralHome.MemberId;
    };

    
    vm.save = function () {
        vm.loading = true;

   
        if (vm.funeralHome.memberId === null || vm.memberId < 0) {
            notificationsService.error("Error", "Please select a valid member.");
            vm.loading = false;
            return;
        }

       
        var funeralHomeData = {
            Id: vm.funeralHome.Id || 0, 
            Name: vm.funeralHome.name,
            EmailAddress: vm.funeralHome.emailAddress,
            PhoneNumber: vm.funeralHome.phoneNumber,
            Contract: vm.funeralHome.contract,
            PriceForService: vm.funeralHome.priceForService,
            DirectorName: vm.funeralHome.directorName,
            FuneralHomeOwnerName: vm.funeralHome.funeralHomeOwnerName,
            MemberId: vm.funeralHome.memberId,
        };

        if (vm.isEdit) {
           
            $http.put('/umbraco/Funeral/FuneralHomes/UpdateFuneralHome/' + vm.funeralHomeId, funeralHomeData)
                .then(function (response) {
                    notificationsService.success("Success", "Funeral home '" + vm.funeralHome.name + "' updated successfully!");
                    vm.originalFuneralHome = angular.copy(vm.funeralHome);
                    vm.hasChanges = false;
                    window.location.href = "/Umbraco#/PanelAdministrativo/Funerarias/funerarias";
                })
                .catch(function (error) {
                    console.error('Error updating funeral home:', error);
                    notificationsService.error("Error", "Failed to update funeral home. Please try again.");
                })
                .finally(function () {
                    vm.loading = false;
                });
        } else {
            
            $http.post('/umbraco/Funeral/FuneralHomes/AddFuneralHome', funeralHomeData)
                .then(function (response) {
                    notificationsService.success("Success", "Funeral home '" + vm.funeralHome.name + "' added successfully!");
                    vm.funeralHome = {
                        Id: null,
                        Name: '',
                        EmailAddress: '',
                        PhoneNumber: '',
                        Contract: '',
                        PriceForService: null,
                        DirectorName: '',
                        FuneralHomeOwnerName: '',
                        MemberId: null,
                    };
                    vm.memberId = null;
                    vm.hasChanges = false;
                    window.location.href = "/Umbraco#/PanelAdministrativo/Funerarias/funerarias";
                })
                .catch(function (error) {
                    console.error('Error saving funeral home:', error);
                    notificationsService.error("Error", "Failed to save funeral home. Please try again.");
                })
                .finally(function () {
                    vm.loading = false;
                });
        }
    };

   
    vm.fetchMembers();
    if (vm.funeralHomeId) {
        vm.fetchFuneralHomeDetails();
    }

    
    $scope.$watch('vm.funeralHome', vm.checkForChanges, true);
    $scope.$watch('vm.memberId', vm.checkForChanges);
});
