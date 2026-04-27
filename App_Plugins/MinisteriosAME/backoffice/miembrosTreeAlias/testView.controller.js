(function () {
    "use strict";

    function testFunction() {

        var vm = this;

        vm.items = [
            {
                "icon": "icon-document",
                "name": "My node 1",
                "published": true,
                "description": "A short description of my node",
                "author": "Author 1"
            },
            {
                "icon": "icon-document",
                "name": "My node 2",
                "published": true,
                "description": "A short description of my node",
                "author": "Author 2"
            }
        ];

        vm.options = {
            includeProperties: [
                { alias: "description", header: "Description" },
                { alias: "author", header: "Author" }
            ]
        };

        vm.selectItem = selectItem;
        vm.clickItem = clickItem;
        vm.selectAll = selectAll;
        vm.isSelectedAll = isSelectedAll;
        vm.isSortDirection = isSortDirection;
        vm.sort = sort;

        function selectAll($event) {
            alert("select all");
        }

        function isSelectedAll() {

        }

        function clickItem(item) {
            alert("click node");
        }

        function selectItem(selectedItem, $index, $event) {
            alert("select node");
        }

        function isSortDirection(col, direction) {

        }

        function sort(field, allow, isSystem) {

        }

    }

    angular.module("umbraco").controller("testView.controller", testFunction);

})();