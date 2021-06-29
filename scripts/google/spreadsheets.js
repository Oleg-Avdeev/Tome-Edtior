const fs = require('fs');

const parser = require('./spreadsheet-to-tsv.js');
const { google } = require('googleapis');

const SCOPES = [
	'https://www.googleapis.com/auth/spreadsheets.readonly',
	'https://www.googleapis.com/auth/drive',
];
const TOKEN_PATH = './scripts/google/token.json';

let hasBeenAuthenticated = false;
let auth = null;

exports.isAuthenticated = function () {
	return hasBeenAuthenticated;
};

exports.authenticate = function (openURLCallback, onAuthorizedCallback) {
	fs.readFile('./scripts/google/credentials-electron.json', (err, content) => {
		if (err) return console.log('Error loading client secret file:', err);
		authorize(JSON.parse(content), openURLCallback, onAuthorizedCallback);
	});
};

exports.getAllSheets = function (onResult) {
	const drive = google.drive({ version: 'v3', auth: auth });

	drive.files.list({
		q: `mimeType='application/vnd.google-apps.spreadsheet'`,
		fields: 'nextPageToken, files(id, name)',
		orderBy: 'viewedByMeTime desc',
	}, (err, res) => {
		if (err) return console.log('The API returned an error: ' + err);
		onResult(res.data);
	});
};

exports.get = function (sheetId, onResult) {
	const sheets = google.sheets({ version: 'v4', auth: auth });

	sheets.spreadsheets.get({
		spreadsheetId: sheetId,
		ranges: [],
		includeGridData: true
	}, (err, res) => {
		if (err) return console.log('The API returned an error: ' + err);
		onResult(parser.parseSpreadsheet(res.data.sheets[0].data[0]));
	});
};

exports.save = function (sheetId) {

};

exports.logOut = function () {
	fs.rmSync (TOKEN_PATH, { force: true });
	hasBeenAuthenticated = false;
	auth = null;
};

function authorize(credentials, openURLCallback, onAuthorizedCallback) {
	const { client_secret, client_id, redirect_uris } = credentials.installed;
	const oAuth2Client = new google.auth.OAuth2(
		client_id, client_secret, redirect_uris[0]);

	fs.readFile(TOKEN_PATH, (err, token) => {
		if (err) return getNewToken(oAuth2Client, openURLCallback, onAuthorizedCallback);
		oAuth2Client.setCredentials(JSON.parse(token));

		auth = oAuth2Client;
		hasBeenAuthenticated = true;
		onAuthorizedCallback(oAuth2Client);
	});
}

function getNewToken(oAuth2Client, openURLCallback, onAuthorizedCallback) {

	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	});

	openURLCallback(authUrl, (code) => {
		oAuth2Client.getToken(code, (err, token) => {

			if (err) return console.error('Error while trying to retrieve access token', err);

			oAuth2Client.setCredentials(token);

			fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
				if (err) return console.error(err);
				console.log('Token stored to', TOKEN_PATH);
			});

			auth = oAuth2Client;
			hasBeenAuthenticated = true;
			onAuthorizedCallback(oAuth2Client);
		});
	});
}