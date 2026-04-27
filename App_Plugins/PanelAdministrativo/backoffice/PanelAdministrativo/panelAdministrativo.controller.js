(function () {
    "use strict";

    function Controller(eventsService) {
        var vm = this;

        // Initialize content
        vm.content = {
            description: "This is the main content area of Panel Administrativo."
        };

        // Save function
        vm.save = function () {
            alert("Save button clicked!");
        };
    }

    angular.module("umbraco").controller("MySectionController", Controller);
})();
