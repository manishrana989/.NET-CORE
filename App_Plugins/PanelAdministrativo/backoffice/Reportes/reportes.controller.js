(function () {
    "use strict";

    angular.module("umbraco").controller("reportesController", function ($http, $location) {
        var vm = this;

        vm.allInvoiceReports = [];
        vm.filteredInvoiceReports = [];
        vm.invoiceSearchQuery = "";
        vm.content = {
            title: "Invoice Reports",
            description: "Manage your invoice reports here."
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
                        dateOfPaymentMade: report.dateOfPaymentMade,
                        supportingContribution: report.supportingContribution, 
                        dependentContribution: report.dependentContribution,
                        deceasedThisMonth: report.deceasedThisMonth, 
                        isChurchMember: report.isChurchMember, 
                        deceasedCountMonth: report.deceasedCountMonth, 
                        deceasedCountYTD: report.deceasedCountYTD,
                    }));
                    vm.filteredInvoiceReports = vm.allInvoiceReports;
                    vm.filterReports();
                });
        };

       
        vm.fetchInvoiceReports();

 
        vm.filterReports = function () {
            
            const searchQuery = vm.invoiceSearchQuery ? vm.invoiceSearchQuery.toLowerCase().trim() : '';
            vm.filteredInvoiceReports = vm.allInvoiceReports.filter(report => {
                return (
                  
                    report.reportName.toLowerCase().includes(searchQuery) ||
                    (report.memberName && report.memberName.toLowerCase().includes(searchQuery))
                );
            });
        };

    
        vm.clickItem = function (report) {
            if (report && report.id) {
                $location.path("/paneladministrativo/reportes/InvoiceReportDetail/" + report.id);
            }
        };

      
        vm.AddProfileclickItem = function () {
            $location.path("/paneladministrativo/reportes/InvoiceReportAddProfile/");
        };

  
        vm.editProfileclickItem = function (report) {
            $location.path("/paneladministrativo/reportes/InvoiceReportAddProfile/" + report.id);
        };


        vm.deleteInvoiceReport = function (report) {
            if (confirm("Are you sure you want to delete this invoice report?")) {
                $http.delete('/umbraco/Reports/InvoiceReport/DeleteInvoiceReport/' + report.id)
                    .then(function (response) {
                        vm.filteredInvoiceReports = vm.filteredInvoiceReports.filter(r => r.id !== report.id);
                    })
                    .catch(function (error) {
                        console.error('Error deleting invoice report:', error);
                    });
            }
        };
    });
})();
