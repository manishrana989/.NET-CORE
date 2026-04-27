angular.module('umbraco').controller('InvoiceReportAddProfilecontroller', function ($http, $scope, notificationsService, $routeParams) {

    var vm = this;
    vm.loading = false;
    vm.originalReport = {};
    vm.invoiceReport = {
        Id: null,
        reportName: '',
        memberId: null,
        supportedMember: null,
        dependentMember: null,
        previousBalance: null,
        currentBalance: null,
        paymentMade: null,
        dateOfPaymentMade: null,
        supportingContribution: null,
        dependentContribution: null,
        deceasedThisMonth: null,
        isChurchMember: null,
        deceasedCountMonth: null,
        deceasedCountYTD:null


    };
    vm.isEdit = false;
    vm.reportId = $routeParams.id || null;


    vm.fetchMembers = function () {
        vm.loading = true;
        $http.get('/umbraco/backoffice/PanelAdministrativo/Miembros/GetMembers')
            .then(function (response) {
                vm.members = [];
                if (response.data.SupportedMembers) {
                    vm.members = vm.members.concat(response.data.SupportedMembers.map(function (member) {
                        member.type = 'Supported';
                        return { id: member.Id, name: member.Name, type: member.type };
                    }));
                }
                if (response.data.DependentMembers) {
                    vm.members = vm.members.concat(response.data.DependentMembers.map(function (member) {
                        member.type = 'Dependent';
                        return { id: member.Id, name: member.Name, type: member.type };
                    }));
                }
                if (response.data.Members) {
                    vm.members = vm.members.concat(response.data.Members.map(function (member) {
                        member.type = 'Member';
                        return { id: member.Id, name: member.Name, type: member.type };
                    }));
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




    vm.fetchInvoiceReportDetails = function () {
        if (vm.reportId) {
            vm.isEdit = true;
            vm.loading = true;
            $http.get('/umbraco/Reports/InvoiceReport/GetInvoiceReportById/' + vm.reportId)
                .then(function (response) {
                    vm.invoiceReport = response.data;
                    vm.invoiceReport.supportedMember = response.data.supportedMemberId || null;
                    vm.invoiceReport.dependentMember = response.data.dependentMemberId || null;
                    vm.invoiceReport.previousBalance = response.data.previousBalance || null;
                    vm.invoiceReport.currentBalance = response.data.currentBalance || null;
                    vm.invoiceReport.paymentMade = response.data.paymentMade || null;
                    vm.invoiceReport.dateOfPaymentMade = response.data.dateOfPaymentMade
                        ? new Date(response.data.dateOfPaymentMade) : null;
                    vm.originalReport = angular.copy(vm.invoiceReport);
                })
                .catch(function (error) {
                    console.error('Error fetching invoice report details:', error);
                    notificationsService.error("Error", "Failed to load invoice report data");
                })
                .finally(function () {
                    vm.loading = false;
                });
        }
    };


    vm.checkForChanges = function () {
        vm.hasChanges = !angular.equals(vm.invoiceReport, vm.originalReport);
    };

  
    vm.save = function () {
        
        vm.loading = true;

        var invoiceReportData = {

            Id: vm.invoiceReport.Id || 0,
            ReportName: vm.invoiceReport.reportName,
            MemberId: vm.invoiceReport.memberId,
            supportedMemberId: vm.invoiceReport.supportedMember,
            dependentMemberId: vm.invoiceReport.dependentMember,
            previousBalance: vm.invoiceReport.previousBalance,
            currentBalance: vm.invoiceReport.currentBalance,
            paymentMade: vm.invoiceReport.paymentMade,
            dateOfPaymentMade: vm.invoiceReport.dateOfPaymentMade,
            supportingContribution: vm.invoiceReport.supportingContribution,
            dependentContribution: vm.invoiceReport.dependentContribution,
            deceasedThisMonth: vm.invoiceReport.deceasedThisMonth,
            isChurchMember: vm.invoiceReport.isChurchMember,
            deceasedCountMonth:vm.invoiceReport.deceasedCountMonth,
            deceasedCountYTD: vm.invoiceReport.deceasedCountYTD

        };

     

        if (vm.isEdit) {
            
            $http.put('/umbraco/Reports/InvoiceReport/UpdateInvoiceReport/' + vm.reportId, invoiceReportData)

                .then(function (response) {
                    
                    notificationsService.success("Success", "Invoice Report '" + vm.invoiceReport.reportName + "' updated successfully!");
                    vm.originalReport = angular.copy(vm.invoiceReport);
                    vm.hasChanges = false;
                    window.location.href = "/umbraco#/PanelAdministrativo/Reportes/reportes";
                })
                .catch(function (error) {
                    console.error('Error updating invoice report:', error);
                    notificationsService.error("Error", "Failed to update invoice report. Please try again.");
                })
                .finally(function () {
                    vm.loading = false;
                });
        } else {
            $http.post('/umbraco/Reports/InvoiceReport/AddInvoiceReport', invoiceReportData)

                .then(function (response) {
                    notificationsService.success("Success", "Invoice Report '" + vm.invoiceReport.reportName + "' added successfully!");
                    vm.invoiceReport = {
                        Id: null,
                        ReportName: '',
                        supportedMember: null,
                        dependentMember: null,
                        memberId: null,
                        previousBalance: null,
                        currentBalance: null,
                        paymentMade: null,
                        dateOfPaymentMade: null,
                         supportingContribution: null,
                        dependentContribution: null,
                        deceasedThisMonth: null,
                        isChurchMember: null,
                        deceasedCountMonth: null,
                        deceasedCountYTD: null
                    };
                    vm.originalReport = angular.copy(vm.invoiceReport);
                    vm.hasChanges = false;
                    window.location.href = "/umbraco#/PanelAdministrativo/Reportes/reportes";
                })
                .catch(function (error) {
                    console.error('Error saving invoice report:', error);
                    notificationsService.error("Error", "Failed to save invoice report. Please try again.");
                })
                .finally(function () {
                    vm.loading = false;
                });
        }
    };

    vm.fetchMembers();
    if (vm.reportId) {
        vm.fetchInvoiceReportDetails();
    }

    $scope.$watch('vm.invoiceReport', vm.checkForChanges, true);
});
