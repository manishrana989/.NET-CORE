/**
 * The controller that is used for a couple different Property Editors: Multi Node Tree Picker, Content Picker,
 * since this is used by MNTP and it supports content, media and members, there is code to deal with all 3 of those types
 * @param {any} $scope
 * @param {any} $q
 * @param {any} $routeParams
 * @param {any} $location
 * @param {any} entityResource
 * @param {any} editorState
 * @param {any} iconHelper
 * @param {any} angularHelper
 * @param {any} navigationService
 * @param {any} localizationService
 * @param {any} editorService
 * @param {any} userService
 * * @param {any} $http
 */
function foreignKeyController($scope,$http, $q, $routeParams, $location, entityResource, editorState, iconHelper, navigationService, localizationService, editorService, userService, overlayService) {

    var vm = {
        labels: {
            general_recycleBin: "",
            general_add: ""
        }
    };

    var unsubscribe;

    function subscribe() {
        unsubscribe = $scope.$on("formSubmitting", function (ev, args) {
            var currIds = _.map($scope.renderModel, function (i) {
                return $scope.model.config.idType === "udi" ? i.udi : i.id;
            });
            $scope.model.value = trim(currIds.join(), ",");
        });

    }

    function trim(str, chr) {
        var rgxtrim = (!chr) ? new RegExp('^\\s+|\\s+$', 'g') : new RegExp('^' + chr + '+|' + chr + '+$', 'g');
        return str.replace(rgxtrim, '');
    }


    function startWatch() {
        //if the underlying model changes, update the view model, this ensures that the view is always consistent with the underlying
        //model if it changes (i.e. based on server updates, or if used in split view, etc...)
        $scope.$watch("model.value", function (newVal, oldVal) {
            if (newVal !== oldVal) {
                syncRenderModel(true);
            }
        });
    }

    $scope.renderModel = [];
    $scope.sortableModel = [];

    $scope.labels = vm.labels;

    $scope.dialogEditor = editorState && editorState.current && editorState.current.isDialogEditor === true;

    $scope.table = $scope.model.config.foreignKeyObject;


    //the default pre-values
    var defaultConfig = {
        multiPicker: false,
        showOpenButton: false,
        showEditButton: false,
        showPathOnHover: false,
        dataTypeKey: null,
        maxNumber: 1,
        minNumber: 0,
        startNode: {
            query: "",
            type: "content",
            id: $scope.model.config.startNodeId ? $scope.model.config.startNodeId : -1 // get start node for simple Content Picker
        }
    };

    var removeAllEntriesAction = {
        labelKey: 'clipboard_labelForRemoveAllEntries',
        labelTokens: [],
        icon: 'trash',
        method: removeAllEntries,
        isDisabled: true
    };


    if ($scope.model.config) {
        //special case, if the `startNode` is falsy on the server config delete it entirely so the default value is merged in
        if (!$scope.model.config.startNode) {
            delete $scope.model.config.startNode;
        }
        //merge the server config on top of the default config, then set the server config to use the result
        $scope.model.config = Utilities.extend(defaultConfig, $scope.model.config);

        // if the property is mandatory, set the minCount config to 1 (unless of course it is set to something already),
        // that way the minCount/maxCount validation handles the mandatory as well
        if ($scope.model.validation && $scope.model.validation.mandatory && !$scope.model.config.minNumber) {
            $scope.model.config.minNumber = 1;
        }

        if ($scope.model.config.multiPicker === true && $scope.umbProperty) {
            var propertyActions = [
                removeAllEntriesAction
            ];

            $scope.umbProperty.setPropertyActions(propertyActions);
        }

        // use these to avoid the nested property lookups/null-checks
        $scope.minNumberOfItems = $scope.model.config.minNumber ? parseInt($scope.model.config.minNumber) : 0;
        $scope.maxNumberOfItems = $scope.model.config.maxNumber ? parseInt($scope.model.config.maxNumber) : 0;
    }

    //Umbraco persists boolean for prevalues as "0" or "1" so we need to convert that!
    $scope.model.config.multiPicker = Object.toBoolean($scope.model.config.multiPicker);
    $scope.model.config.showOpenButton = Object.toBoolean($scope.model.config.showOpenButton);
    $scope.model.config.showEditButton = Object.toBoolean($scope.model.config.showEditButton);
    $scope.model.config.showPathOnHover = Object.toBoolean($scope.model.config.showPathOnHover);

    var entityType = $scope.table;

    $scope.allowOpenButton = false;
    $scope.allowEditButton = entityType === "Document";
    $scope.allowRemoveButton = true;


    //the dialog options for the picker
    var dialogOptions = {
        multiPicker: $scope.model.config.multiPicker,
        entityType: entityType,
        filterCssClass: "not-allowed not-published",
        startNodeId: null,
        dataTypeKey: $scope.model.dataTypeKey,
        currentNode: editorState ? editorState.current : null,
        callback: function (data) {
            if (Utilities.isArray(data)) {
                _.each(data, function (item, i) {
                    $scope.add(item);
                });
            } else {
                $scope.clear();
                $scope.add(data);
            }
            setDirty();
        },
        treeAlias: $scope.model.config.startNode.type,
        section: $scope.model.config.startNode.type,
        idType: "udi"
    };

    //since most of the pre-value config's are used in the dialog options (i.e. maxNumber, minNumber, etc...) we'll merge the
    // pre-value config on to the dialog options
    Utilities.extend(dialogOptions, $scope.model.config);

    dialogOptions.dataTypeKey = $scope.model.dataTypeKey;

    // if we can't pick more than one item, explicitly disable multiPicker in the dialog options
    if ($scope.maxNumberOfItems === 1) {
        dialogOptions.multiPicker = false;
    }

    // add the current filter (if any) as title for the filtered out nodes
    if ($scope.model.config.filter) {
        localizationService.localize("contentPicker_allowedItemTypes", [$scope.model.config.filter]).then(function (data) {
            dialogOptions.filterTitle = data;
        });
    }

    // searchable list views
    if ($routeParams.section === "settings" && $routeParams.tree === "documentTypes") {
        //if the content-picker is being rendered inside the document-type editor, we don't need to process the startnode query
        dialogOptions.startNodeId = -1;
    }
    else if ($scope.model.config.startNode.query) {
        //if we have a query for the startnode, we will use that.
        var rootId = $routeParams.id;
        //entityResource.getByQuery($scope.model.config.startNode.query, rootId, "Document").then(function (ent) {
        //    dialogOptions.startNodeId = ($scope.model.config.idType === "udi" ? ent.udi : ent.id).toString();
        //});
    }
    else {
        dialogOptions.startNodeId = $scope.model.config.startNode.id;
    }

    //dialog
    $scope.openCurrentPicker = function () {
        $scope.currentPicker = dialogOptions;

        $scope.currentPicker.submit = function (model) {
            if (Utilities.isArray(model.selection)) {
                _.each(model.selection, function (item, i) {
                    $scope.add(item);
                });
                setDirty();
            }
            setDirty();
            editorService.close();
        }

        $scope.currentPicker.close = function () {
            editorService.close();
        }


        $scope.currentPicker.view = "/App_Plugins/DatabaseExtensionKit/backoffice/foreignKey/customTreePicker.html";
        $scope.currentPicker.size = "small";
        editorService.open($scope.currentPicker);

    };

    $scope.remove = function () {
        $scope.model.value = "";
    };

    $scope.showNode = function (index) {
        var item = $scope.renderModel[index];
        var id = item.id;
        var section = $scope.model.config.startNode.type.toLowerCase();
    }

    $scope.add = function (item) {
        var currIds = $scope.model.value ? $scope.model.value.split(',') : [];

        var itemId = ($scope.model.config.idType === "udi" ? item.udi : item.id).toString();

        if (currIds.indexOf(itemId) < 0) {
            currIds.push(itemId);
            $scope.model.value = currIds.join();
        }

        removeAllEntriesAction.isDisabled = false;
    };

    $scope.clear = function () {
        $scope.model.value = null;
        removeAllEntriesAction.isDisabled = true;
    };


    //when the scope is destroyed we need to unsubscribe
    $scope.$on('$destroy', function () {
        if (unsubscribe) {
            unsubscribe();
        }
    });

    function setDirty() {
        if ($scope.contentPickerForm && $scope.contentPickerForm.modelValue) {
            $scope.contentPickerForm.modelValue.$setDirty();
        }
    }

    function syncRenderModel(doValidation) {

        var valueIds = $scope.model.value ? $scope.model.value.split(',') : [];

        //sync the sortable model
        $scope.sortableModel = valueIds;

        removeAllEntriesAction.isDisabled = valueIds.length === 0;


        //load current data if anything selected
        if (valueIds.length > 0) {

            //need to determine which items we already have loaded
            var renderModelIds = _.map($scope.renderModel, function (d) {
                return ($scope.model.config.idType === "udi" ? d.udi : d.id).toString();
            });

            //get the ids that no longer exist
            var toRemove = _.difference(renderModelIds, valueIds);


            //remove the ones that no longer exist
            for (var j = 0; j < toRemove.length; j++) {
                var index = renderModelIds.indexOf(toRemove[j]);
                $scope.renderModel.splice(index, 1);
            }

            //get the ids that we need to lookup entities for
            var missingIds = _.difference(valueIds, renderModelIds);

            if (missingIds.length > 0) {
                $http({
                    method: 'GET',
                    url: '/Umbraco/backoffice/DatabaseExtensionKit/Object/GetForeignKeyObject?table=' + $scope.table + '&id=' + $scope.model.value,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(function (response) {
                    var entity = {
                        icon: "document",
                        name: response.data.name,
                        id: $scope.model.value
                    }
                    addSelectedItem(entity);

                    if (doValidation) {
                        validate();
                    }
                }); 

            }         
        }
        else {
            $scope.renderModel = [];

            if (doValidation) {
                validate();
            }

        }


    }

    function addSelectedItem(item) {
        // set icon
        if (item.icon) {
            item.icon = iconHelper.convertFromLegacyIcon(item.icon);
        }

        // set default icon
        if (!item.icon) {
            switch (entityType) {
                case "Document":
                    item.icon = "icon-document";
                    break;
                case "Media":
                    item.icon = "icon-picture";
                    break;
                case "Member":
                    item.icon = "icon-user";
                    break;
            }
        }

        $scope.renderModel.push({
            "name": item.name,
            "id": item.id,
            "udi": item.udi,
            "icon": item.icon,
            "path": item.path,
            "url": item.url,
            "key": item.key,
            "trashed": item.trashed,
            "published": (item.metaData && item.metaData.IsPublished === false && entityType === "Document") ? false : true
            // only content supports published/unpublished content so we set everything else to published so the UI looks correct
        });
    }


    function removeAllEntries() {
        localizationService.localizeMany(["content_nestedContentDeleteAllItems", "general_delete"]).then(function (data) {
            overlayService.confirmDelete({
                title: data[1],
                content: data[0],
                close: function () {
                    overlayService.close();
                },
                submit: function () {
                    $scope.clear();
                    overlayService.close();
                }
            });
        });
    }

    function validate() {
        if ($scope.contentPickerForm) {
            //Validate!
            var hasItemsOrMandatory = $scope.renderModel.length !== 0 || ($scope.model.validation && $scope.model.validation.mandatory);
            if (hasItemsOrMandatory && $scope.minNumberOfItems && $scope.minNumberOfItems > $scope.renderModel.length) {
                $scope.contentPickerForm.minCount.$setValidity("minCount", false);
            }
            else {
                $scope.contentPickerForm.minCount.$setValidity("minCount", true);
            }
        }
    }

    function init() {


        localizationService.localizeMany(["general_recycleBin", "general_add"])
            .then(function (data) {
                vm.labels.general_recycleBin = data[0];
                vm.labels.general_add = data[1];

                syncRenderModel(true);
                startWatch();
                subscribe();
                validate();
            });
    }

    init();

}

angular.module('umbraco').controller("ForeignKeyController", foreignKeyController);