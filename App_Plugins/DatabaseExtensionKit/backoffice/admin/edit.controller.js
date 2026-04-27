angular.module("umbraco").controller("editAdminController", function ($scope, $routeParams,$route, notificationsService,
    localizationService, editorService, eventsService, overlayService, $http, navigationService, contentTypeResource, $q, $filter, contentTypeHelper, treeService) {


    $scope.model = {
        id: 0,
        name:'',
        properties:[] 
    };

    $scope.sortingMode = false;
    $scope.sortingButtonKey = "general_reorder"


    function init() {
        if ($routeParams.id != -1) {
            contentTypeResource.getById($routeParams.id)
                .then(function (data) {
                    $scope.model.id = $routeParams.id;
                    $scope.model.name = data.name;
                    $scope.model.properties = data.groups[0].properties;
                });
        }
    }


    $scope.addNewProperty = group => {
        let newProperty = {
            label: null,
            alias: null,
            propertyState: "init",
            validation: {
                mandatory: false,
                mandatoryMessage: null,
                pattern: null,
                patternMessage: null
            },
            labelOnTop: false
        };

        const propertySettings = {
            title: "Property settings",
            property: newProperty,
            contentType: $scope.contentType,
            contentTypeName: $scope.model.name,
            contentTypeAllowCultureVariant: $scope.model.allowCultureVariant,
            contentTypeAllowSegmentVariant: $scope.model.allowSegmentVariant,
            view: "/App_Plugins/DatabaseExtensionKit/backoffice/customPropertySettings/customPropertySettings.html",
            size: "small",
            submit: model => {
                newProperty = { ...model.property };
                newProperty.propertyState = "active";

                $scope.model.properties.push(newProperty);

                editorService.close();
            },
            close: () => {
                editorService.close();
            }
        };

        editorService.open(propertySettings);

    };

    $scope.deleteProperty = (properties, property) => {
        const propertyName = property.label || "";

        const localizeMany = localizationService.localizeMany(['general_delete']);
        const localize = localizationService.localize('contentTypeEditor_confirmDeletePropertyMessage', [propertyName]);

        $q.all([localizeMany, localize]).then(values => {
            const translations = values[0];
            const message = values[1];

            overlayService.confirmDelete({
                title: `${translations[0]} ${propertyName}`,
                content: message,
                submitButtonLabelKey: 'actions_delete',
                submit: () => {
                    const index = properties.findIndex(p => property.id ? p.id === property.id : p === property);
                    $scope.model.properties.splice(index, 1);
                    eventsService.emit("editors.groupsBuilder.changed");

                    overlayService.close();
                }
            });
        });
    }; 

    $scope.editPropertyTypeSettings = (property, group) => {

        if (!property.inherited) {

            var oldPropertyModel = Utilities.copy(property);
            if (oldPropertyModel.allowCultureVariant === undefined) {
                // this is necessary for comparison when detecting changes to the property
                oldPropertyModel.allowCultureVariant = $scope.model.allowCultureVariant;
                oldPropertyModel.alias = "";
            }
            var propertyModel = Utilities.copy(property);

            var propertySettings = {
                title: "Property settings",
                property: propertyModel,
                contentType: $scope.contentType,
                contentTypeName: $scope.model.name,
                contentTypeAllowCultureVariant: $scope.model.allowCultureVariant,
                contentTypeAllowSegmentVariant: $scope.model.allowSegmentVariant,
                view: "/App_Plugins/DatabaseExtensionKit/backoffice/customPropertySettings/customPropertySettings.html",
                size: "small",
                submit: model => {

                    property.inherited = false;
                    property.dialogIsOpen = false;
                    property.propertyState = "active";

                    // apply all property changes
                    property.label = propertyModel.label;
                    property.alias = propertyModel.alias;
                    property.description = propertyModel.description;
                    property.config = propertyModel.config;
                    property.editor = propertyModel.editor;
                    property.view = propertyModel.view;
                    property.dataTypeId = propertyModel.dataTypeId;
                    property.dataTypeIcon = propertyModel.dataTypeIcon;
                    property.dataTypeName = propertyModel.dataTypeName;
                    property.validation.mandatory = propertyModel.validation.mandatory;
                    property.validation.mandatoryMessage = propertyModel.validation.mandatoryMessage;
                    property.validation.pattern = propertyModel.validation.pattern;
                    property.validation.patternMessage = propertyModel.validation.patternMessage;
                    property.showOnMemberProfile = propertyModel.showOnMemberProfile;
                    property.memberCanEdit = propertyModel.memberCanEdit;
                    property.isSensitiveData = propertyModel.isSensitiveData;
                    property.isSensitiveValue = propertyModel.isSensitiveValue;
                    property.allowCultureVariant = propertyModel.allowCultureVariant;
                    property.allowSegmentVariant = propertyModel.allowSegmentVariant;
                    property.labelOnTop = propertyModel.labelOnTop;

                    // update existing data types
                    if (model.updateSameDataTypes) {
                        updateSameDataTypes(property);
                    }

                    // close the editor
                    editorService.close();

                    if (group) {
                        // push new init property to group
                        addInitProperty(group);

                        // set focus on init property
                        var numberOfProperties = group.properties.length;
                        group.properties[numberOfProperties - 1].focus = true;
                    }

                    eventsService.emit("editors.groupsBuilder.changed");
                },
                close: () => {
                    if (_.isEqual(oldPropertyModel, propertyModel) === false) {
                        localizationService.localizeMany([
                            "general_confirm",
                            "contentTypeEditor_propertyHasChanges",
                            "general_cancel",
                            "general_ok"
                        ]).then(data => {
                            const overlay = {
                                title: data[0],
                                content: data[1],
                                closeButtonLabel: data[2],
                                submitButtonLabel: data[3],
                                submitButtonStyle: "danger",
                                close: () => {
                                    overlayService.close();
                                },
                                submit: () => {
                                    // close the confirmation
                                    overlayService.close();
                                    // close the editor
                                    editorService.close();
                                }
                            };

                            overlayService.open(overlay);
                        });
                    }
                    else {
                        // remove the editor
                        editorService.close();
                    }
                }
            };

            // open property settings editor
            editorService.open(propertySettings);

            // set property states
            property.dialogIsOpen = true;

        }
    };

    $scope.save = function () {
            $http({
                method: 'POST',
                url: '/Umbraco/backoffice/DatabaseExtensionKit/ObjectType/Save',
                headers: {
                    'Content-Type': 'application/json'
                },
                dataType: 'json',
                data: $scope.model
            }).then(function (response) {          
                eventsService.emit("editors.documentType.saved");
                if (response.data != '') {
                    notificationsService.warning(response.data);
                } else {
                    localizationService.localize("itemSaved").then(function (value) {
                        notificationsService.success(value);
                    });
                }

                navigationService.syncTree({ tree: "admin", path: ["-1", "dbExtensionKitAdmin", $scope.contentId], forceReload: true }).then(function (syncArgs) {
                    $scope.currentNode = syncArgs.node;
                    if ($routeParams.id == $scope.currentNode.id) {
                        $route.reload();
                    }

                });

                treeService.clearCache();
            },
                function errorCallback(response) {
                    notificationsService.error(response.data);
                }); 


    }

    $scope.toggleSortingMode = () => {

        if ($scope.sortingMode === true) {

            var sortOrderMissing = false;

            if (!sortOrderMissing) {
                $scope.sortingMode = false;
                $scope.sortingButtonKey = "general_reorder";
            }

        } else {
            $scope.sortingMode = true;
            $scope.sortingButtonKey = "general_reorderDone";
        }

        $scope.$broadcast('umbOverflowChecker.checkOverflow');
    };


    $scope.onChangePropertySortOrderValue = () => {
        $scope.model.properties = $filter('orderBy')($scope.model.properties, 'sortOrder');
    };

    const defaultOptions = {
        axis: '',
        tolerance: "pointer",
        opacity: 0.7,
        scroll: true,
        cursor: "move",
        zIndex: 6000,
        forcePlaceholderSize: true,
        dropOnEmpty: true,
        helper: "clone",
        appendTo: "body"
    };

    $scope.sortableOptionsProperty = {
        ...defaultOptions,
        connectWith: ".umb-group-builder__properties",
        placeholder: "umb-group-builder__property_sortable-placeholder",
        handle: ".umb-group-builder__property-handle",
        items: ".umb-group-builder__property-sortable",
        stop: (e, ui) => {
            contentTypeHelper.updatePropertiesSortOrder($scope.model.properties);
        }
    };

    function updateSameDataTypes(newProperty) {

        // find each property
        Utilities.forEach($scope.model.groups, group => {
            Utilities.forEach(group.properties, property => {

                if (property.dataTypeId === newProperty.dataTypeId) {

                    // update property data
                    property.config = newProperty.config;
                    property.editor = newProperty.editor;
                    property.view = newProperty.view;
                    property.dataTypeId = newProperty.dataTypeId;
                    property.dataTypeIcon = newProperty.dataTypeIcon;
                    property.dataTypeName = newProperty.dataTypeName;

                }

            });
        });
    }
    init();

});