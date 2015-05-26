/**
 * Created by Raf on 14/05/2015.
 */
var AssetEnvironmentProperty =
{
    "__python_obj__": "tools.ModelDefinitions.AssetEnvironmentPropertiesModel",
    "associations": [],
    "attributes": [
    ],
    "environment": "",
    "attributesDictionary": {}
};
var AssetEnvironmentPropertyAttribute =
        {
            "__python_obj__": "tools.ModelDefinitions.AssetSecurityAttribute",
            "rationale": "",
            "value": "",
            "name": ""
        };
var mainAssetObject =
{
    "__python_obj__": "Asset.Asset",
    "theEnvironmentDictionary": {},
    "theDescription": "",
    "theAssetPropertyDictionary": {},
    "theSignificance": "",
    "theId": -1,
    "theTags": [],
    "theCriticalRationale": "",
    "theInterfaces": [],
    "theType": "",
    "theName": "",
    "isCritical": 0,
    "theShortCode": "",
    "theEnvironmentProperties": []
};
var roleDefaultObject = {
    "__python_obj__": "Role.Role",
    "theEnvironmentDictionary": {},
    "theEnvironmentProperties": [],
    "theId": -1,
    "costLookup": {
    },
    "theType": "",
    "theName": "",
    "theShortCode": "",
    "theDescription": ""
};
var tensionDefault = {
    "__python_obj__": "tools.PseudoClasses.EnvironmentTensionModel",
    "rationale": "",
    "attr_id": -1,
    "base_attr_id": -1,
    "value": -1
};
var environmentDefault = {"__python_obj__": "Environment.Environment",
    "theId": -1,
    "theDuplicateProperty": "",
    "theTensions": [],
    "theName": "",
    "theEnvironments": [],
    "theShortCode": "",
    "theDescription": "",
    "theOverridingEnvironment": ""
};
var vulnerabilityDefault = {
    "__python_obj__": "Vulnerability.Vulnerability",
    "theEnvironmentDictionary": {},
    "theVulnerabilityName": "",
    "theVulnerabilityType": "",
    "theTags": [],
    "theVulnerabilityDescription": "",
    "theVulnerabilityId": -1,
    "severityLookup": {},
    "theEnvironmentProperties": []
};
var vulEnvironmentsDefault = {
    "__python_obj__": "VulnerabilityEnvironmentProperties.VulnerabilityEnvironmentProperties",
    "theEnvironmentName": "",
    "theAssets": [],
    "theSeverity": ""
};
var threatEnvironmentDefault = {"__python_obj__": "ThreatEnvironmentProperties.ThreatEnvironmentProperties",
    "theAssets": [],
    "theLikelihood": "",
    "theEnvironmentName": "",
    "theAttackers": [],
    "theRationale": [],
    "theProperties": []
};