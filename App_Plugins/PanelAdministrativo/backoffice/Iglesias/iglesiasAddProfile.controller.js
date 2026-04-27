angular.module('umbraco').controller('iglesiasAddProfileController', function ($http, $scope, notificationsService, $routeParams) {
    var vm = this;
    vm.loading = false;
    vm.originalChurch = {};
    vm.church = { memberIds: [] }; 
    vm.selectedMemberIds = {}; 
    vm.isEdit = false;
    vm.churchId = $routeParams.id || null;


    vm.fetchMembers = function () {
        vm.loading = true;
        $http.get('/umbraco/backoffice/PanelAdministrativo/Miembros/GetMembers')
            .then(function (response) {
                
                vm.members = response.data.Members.map(member => ({
                    id: member.Id,
                    name: member.Name
                }));

                if (vm.isEdit) {
                    vm.members.forEach(function (member) {
                        if (vm.church.memberIds.includes(member.id)) {
                            vm.selectedMemberIds[member.id] = true; 
                        }
                    });
                }
            })
            .catch(function (error) {
                console.error('Error fetching members:', error);
                notificationsService.error("Error", "Failed to load members data");
            })
            .finally(function () {
                vm.loading = false;
            });
    };

    
    vm.fetchChurchDetails = function () {
        if (vm.churchId) {
            vm.isEdit = true;
            vm.loading = true;
            $http.get('/umbraco/Church/Iglesias/GetChurchById/' + vm.churchId)
                .then(function (response) {
                    
                    vm.church = response.data;
                    vm.originalChurch = angular.copy(vm.church);

                    if (typeof vm.church.memberIds === 'string') {
                        vm.church.memberIds = [vm.church.memberIds]; 
                    }

                   
                    if (!Array.isArray(vm.church.memberIds)) {
                        vm.church.memberIds = [];
                    }

     
                    if (vm.members && vm.members.length > 0) {
                        vm.members.forEach(function (member) {
                            if (vm.church.memberIds.includes(member.id)) {
                                vm.selectedMemberIds[member.id] = true; 
                            }
                        });
                    }
                })
                .catch(function (error) {
                    console.error('Error fetching church details:', error);
                    notificationsService.error("Error", "Failed to load church data");
                })
                .finally(function () {
                    vm.loading = false;
                });
        }
    };


    vm.checkForChanges = function () {
        vm.hasChanges = !angular.equals(vm.church, vm.originalChurch);
    };


    vm.save = function () {

        vm.church.memberIds = Object.keys(vm.selectedMemberIds).filter(id => vm.selectedMemberIds[id]);


        if (vm.church.memberIds.length === 0) {
            notificationsService.error("Error", "Please select at least one member.");
            return;
        }
  
     var churchData = {
    Id: vm.church.Id || 0,
    Name: vm.church.name,
    EmailAddress: vm.church.emailAddress,
    PhoneNumber: vm.church.phoneNumber,
    Address: vm.church.address
        ? `${vm.church.address || ''}, ${vm.church.state || ''}, ${vm.church.city || ''}, ${vm.church.country || ''}, ${vm.church.zipcode || ''}`.replace(/,\s*,/g, ',').replace(/,\s*$/, '')
        : vm.originalChurch.Address, // Use original address if not updated
    MemberIds: vm.church.memberIds
};
        var savePromise;


        if (vm.isEdit) {
        
            savePromise = $http.put('/umbraco/Church/Iglesias/UpdateChurch/' + vm.churchId, churchData);
        } else {

            savePromise = $http.post('/umbraco/Church/Iglesias/AddChurch', churchData);
        }

        savePromise
            .then(function (response) {
          
                var successMessage = vm.isEdit ? "updated" : "added";
                notificationsService.success("Success", "Church '" + vm.church.name + "' " + successMessage + " successfully!");
                vm.originalChurch = angular.copy(vm.church); 
                vm.hasChanges = false;
                window.location.href = "/umbraco#/PanelAdministrativo/Iglesias/iglesias"; 
            })
            .catch(function (error) {
                console.error('Error saving church:', error);
                notificationsService.error("Error", "Failed to save church. Please try again.");
            })
            .finally(function () {
                vm.loading = false;
            });
    };


    vm.fetchMembers();
    if (vm.churchId) {
        vm.fetchChurchDetails();
    }


    $scope.$watch('vm.church', vm.checkForChanges, true);
});
