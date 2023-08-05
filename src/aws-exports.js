/* eslint-disable */
// WARNING: DO NOT EDIT. This file is automatically generated by AWS Amplify. It will be overwritten.

const awsmobile = {
    "aws_project_region": "us-west-2",
    "aws_cognito_identity_pool_id": "us-west-2:3d146bea-6a09-400c-85e7-2a8c13ebd764",
    "aws_cognito_region": "us-west-2",
    "aws_user_pools_id": "us-west-2_VXUS2q1PM",
    "aws_user_pools_web_client_id": "3lfnaahkhjaotal2m13huv05ji",
    "oauth": {
        "domain": "tifappe713c872-e713c872-dev.auth.us-west-2.amazoncognito.com",
        "scope": [
            "phone",
            "email",
            "openid",
            "profile",
            "aws.cognito.signin.user.admin"
        ],
        "redirectSignIn": "exp://192.168.42.5:19000/,tifapp://",
        "redirectSignOut": "tifapp://,exp://192.168.42.5:19000/",
        "responseType": "code"
    },
    "federationTarget": "COGNITO_USER_POOLS",
    "aws_cognito_username_attributes": [
        "EMAIL"
    ],
    "aws_cognito_social_providers": [],
    "aws_cognito_signup_attributes": [
        "EMAIL"
    ],
    "aws_cognito_mfa_configuration": "OFF",
    "aws_cognito_mfa_types": [
        "SMS"
    ],
    "aws_cognito_password_protection_settings": {
        "passwordPolicyMinLength": 8,
        "passwordPolicyCharacters": []
    },
    "aws_cognito_verification_mechanisms": [
        "EMAIL"
    ],
    "geo": {
        "amazon_location_service": {
            "region": "us-west-2",
            "search_indices": {
                "items": [
                    "placeIndex7c0b71bf-dev"
                ],
                "default": "placeIndex7c0b71bf-dev"
            }
        }
    },
    "Analytics": {
        "AWSPinpoint": {
            "appId": "ced102bb50484960828f8b5f526ff6c3",
            "region": "us-west-2"
        }
    }
};


export default awsmobile;
