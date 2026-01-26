const axios = require('axios');
const crypto = require('crypto');
const FormData = require('form-data');

// These parameters should be used for all requests
const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN; // Example: sbx:uY0CgwELmgUAEyl4hNWxLngb.0WSeQeiYny4WEqmAALEAiK2qTC96fBad - Please don't forget to change when switching to production
const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY; // Example: Hej2ch71kG2kTd1iIUDZFNsO5C1lh5Gq - Please don't forget to change when switching to production
const SUMSUB_BASE_URL = 'https://api.sumsub.com';

var config = {};
config.baseURL= SUMSUB_BASE_URL;

// Make sure to specify 'Content-Type' header with value of 'application/json' if you're not sending a body for most of requests

// This function creates signature for the request as described here: https://docs.sumsub.com/reference/authentication

export function createSignature(config) {
    console.log('Creating a signature for the request...');

    var ts = Math.floor(Date.now() / 1000);
    const signature = crypto.createHmac('sha256',  SUMSUB_SECRET_KEY);
    signature.update(ts + config.method.toUpperCase() + config.url);

    if (config.data instanceof FormData) {
        signature.update(config.data.getBuffer());
    } else if (config.data) {
        signature.update(config.data);
    }

    config.headers['X-App-Access-Ts'] = ts;
    config.headers['X-App-Access-Sig'] = signature.digest('hex');

    return config;
}

// These functions configure requests for specified method

// https://docs.sumsub.com/reference/create-applicant
function createApplicant(externalUserId, levelName) {
    console.log("Creating an applicant...");

    var method = 'post';
    var url = '/resources/applicants?levelName=' + encodeURIComponent(levelName);
    var ts = Math.floor(Date.now() / 1000);

    var body = {
        externalUserId: externalUserId
    };

    var headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-App-Token': SUMSUB_APP_TOKEN
    };

    config.method = method;
    config.url = url;
    config.headers = headers;
    config.data = JSON.stringify(body);

    return config;
}

// https://docs.sumsub.com/reference/get-applicant-review-status
function getApplicantStatus(applicantId) {
    console.log("Getting the applicant status...");

    var method = 'get';
    var url = `/resources/applicants/${applicantId}/status`;

    var headers = {
        'Accept': 'application/json',
        'X-App-Token': SUMSUB_APP_TOKEN
    };

    config.method = method;
    config.url = url;
    config.headers = headers;
    config.data = null;

    return config;
}

// https://docs.sumsub.com/reference/get-applicant-data-via-externaluserid
export function getApplicantData(externalUserId) {
    console.log("Getting the applicant data...");

    var method = 'get';
    var url = `/resources/applicants/-;externalUserId=${externalUserId}/one`;

    var headers = {
        'Accept': 'application/json',
        'X-App-Token': SUMSUB_APP_TOKEN
    };

    config.method = method;
    config.url = url;
    config.headers = headers;
    config.data = null;

    return config;
}

// https://docs.sumsub.com/reference/generate-access-token
export function createAccessToken(externalUserId, levelName = 'basic-kyc-level', ttlInSecs = 600) {
    console.log("Creating an access token for initializng SDK...");

    var body = {
        userId: externalUserId,
        levelName: levelName,
        ttlInSecs: ttlInSecs
    };

    var method = 'post';
    var url = '/resources/accessTokens/sdk';

    var headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-App-Token': SUMSUB_APP_TOKEN
    };

    config.method = method;
    config.url = url;
    config.headers = headers;
    config.data = JSON.stringify(body);

    return config;
}

// ============ KYB (Know Your Business) Functions ============

// https://docs.sumsub.com/reference/create-applicant
// Creates a company applicant for KYB verification
export function createCompanyApplicant(externalUserId, levelName, companyInfo) {
    console.log("Creating a company applicant...");

    var method = 'post';
    var url = '/resources/applicants?levelName=' + encodeURIComponent(levelName);

    var body = {
        externalUserId: externalUserId,
        type: 'company',
        info: {
            companyInfo: {
                companyName: companyInfo.companyName,
                registrationNumber: companyInfo.registrationNumber,
                country: companyInfo.country,
                legalAddress: companyInfo.legalAddress,
                incorporatedOn: companyInfo.incorporatedOn,
                type: companyInfo.type,
                email: companyInfo.email,
                phone: companyInfo.phone,
                website: companyInfo.website,
                taxId: companyInfo.taxId
            }
        }
    };

    // Remove undefined fields from companyInfo
    Object.keys(body.info.companyInfo).forEach(key => {
        if (body.info.companyInfo[key] === undefined) {
            delete body.info.companyInfo[key];
        }
    });

    var headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-App-Token': SUMSUB_APP_TOKEN
    };

    config.method = method;
    config.url = url;
    config.headers = headers;
    config.data = JSON.stringify(body);

    return config;
}

// https://docs.sumsub.com/reference/add-company-beneficial-owner
// Adds a beneficial owner to a company applicant
export function addBeneficialOwner(applicantId, beneficiaryInfo) {
    console.log("Adding beneficial owner to company...");

    var method = 'post';
    var url = `/resources/applicants/${applicantId}/info/companyInfo/beneficiaries`;

    var body = {
        applicant: {
            externalUserId: beneficiaryInfo.externalUserId,
            type: 'individual',
            info: {
                firstName: beneficiaryInfo.firstName,
                lastName: beneficiaryInfo.lastName,
                dob: beneficiaryInfo.dob,
                country: beneficiaryInfo.country,
                nationality: beneficiaryInfo.nationality
            }
        },
        positions: beneficiaryInfo.positions || ['shareholder'],
        type: beneficiaryInfo.type || 'ubo',
        shareSize: beneficiaryInfo.shareSize,
        inRegistry: beneficiaryInfo.inRegistry
    };

    var headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-App-Token': SUMSUB_APP_TOKEN
    };

    config.method = method;
    config.url = url;
    config.headers = headers;
    config.data = JSON.stringify(body);

    return config;
}

// https://docs.sumsub.com/reference/get-company-beneficial-owners
// Gets all beneficial owners for a company applicant
export function getBeneficialOwners(applicantId) {
    console.log("Getting beneficial owners...");

    var method = 'get';
    var url = `/resources/applicants/${applicantId}/info/companyInfo/beneficiaries`;

    var headers = {
        'Accept': 'application/json',
        'X-App-Token': SUMSUB_APP_TOKEN
    };

    config.method = method;
    config.url = url;
    config.headers = headers;
    config.data = null;

    return config;
}

// Convenience wrapper for creating KYB access token
export function createKYBAccessToken(externalUserId, levelName = 'basic-kyb-level', ttlInSecs = 600) {
    console.log("Creating a KYB access token for initializing SDK...");
    return createAccessToken(externalUserId, levelName, ttlInSecs);
}

// https://docs.sumsub.com/reference/get-applicant-data
// Gets company applicant data including verification status
export function getCompanyApplicantData(externalUserId) {
    console.log("Getting company applicant data...");

    var method = 'get';
    var url = `/resources/applicants/-;type=company&externalUserId=${externalUserId}/one`

    var headers = {
        'Accept': 'application/json',
        'X-App-Token': SUMSUB_APP_TOKEN
    };

    config.method = method;
    config.url = url;
    config.headers = headers;
    config.data = null;

    return config;
}
