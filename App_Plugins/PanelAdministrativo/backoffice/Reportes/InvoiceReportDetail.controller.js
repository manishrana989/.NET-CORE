angular.module("umbraco").controller("InvoiceReportDetailcontroller", function ($scope, $http, notificationsService, $routeParams) {
    var vm = this;
    vm.loading = true;
    vm.errorMessage = "";
    vm.invoiceReport = {};
    vm.filteredInvoiceReports = [];
    vm.reportId = $routeParams.id; 

    
    vm.loadInvoiceReport = function () {
        $http.get("/umbraco/Reports/InvoiceReport/GetInvoiceReportById?id=" + vm.reportId)
            .then(function (response) {
                
                vm.invoiceReport = {
                    reportName: response.data.reportName,
                    member: response.data.member,
                    memberId: response.data.memberId,
                    supportedMember: response.data.supportedMember,
                    supportedMemberId: response.data.supportedMemberId,
                    dependentMember: response.data.dependentMember,
                    dependentMemberId: response.data.dependentMemberId,
                    previousBalance: response.data.previousBalance,
                    currentBalance: response.data.currentBalance,
                    paymentMade: response.data.paymentMade,
                    dateOfPaymentMade: response.data.dateOfPaymentMade,
                    supportingContribution: response.data.supportingContribution,
                    dependentContribution: response.data.dependentContribution,
                    deceasedThisMonth: response.data.deceasedThisMonth,
                    isChurchMember: response.data.isChurchMember,
                    deceasedCountMonth: response.data.deceasedCountMonth,
                    deceasedCountYTD: response.data.deceasedCountYTD,
                };
                vm.loading = false;
            })
            .catch(function (error) {
                vm.errorMessage = "Error loading invoice report details.";
                vm.loading = false;
                notificationsService.error("Error", "Could not load invoice report details.");
            });
    };

 
    vm.fetchInvoiceReports = function () {
        $http.get('/umbraco/Reports/InvoiceReport/GetInvoiceReports')
            .then(function (response) {
                vm.allInvoiceReports = response.data.map(report => ({
                    id: report.id,
                    reportName: report.reportName,
                    memberName: report.member,
                    supportedMemberName: report.supportedMember,
                    dependentMemberName: report.dependentMember,
                    previousBalance: report.previousBalance,
                    currentBalance: report.currentBalance,
                    paymentMade: report.paymentMade,
                    dateOfPaymentMade: report.dateOfPaymentMade
                }));

        
                vm.filteredInvoiceReports = vm.allInvoiceReports.filter(report => report.id !== parseInt(vm.reportId));
            

                console.log("Filtered invoice reports:", vm.filteredInvoiceReports);
            })
            .catch(function (error) {
                console.error("Error fetching invoice reports:", error);
                notificationsService.error("Error", "Failed to load invoice reports.");
            });
    };


    vm.save = function () {
        vm.loading = true;
        $http.post("/api/InvoiceReports/UpdateInvoiceReport", vm.invoiceReport)
            .then(function () {
                
                notificationsService.success("Success", "Invoice report details updated successfully.");
                vm.loading = false;
            })
            .catch(function (error) {
                vm.errorMessage = "Error saving invoice report details.";
                vm.loading = false;
                notificationsService.error("Error", "Could not save invoice report details.");
            });
    };


    vm.loadInvoiceReport();
    vm.fetchInvoiceReports();
});
