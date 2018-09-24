const Promise = require('bluebird')
const fs = Promise.promisifyAll(require("fs-extra"))
const path = require("path")

function packageDesktop(dirname, version) {
	console.log("Building desktop client for v" + version + "...")
	const electronSourcesDir = path.join(dirname, '/app-desktop/dist/')
	const resourcesDir = path.join(electronSourcesDir, "/resources/")

	//prepare files
	return fs.removeAsync(electronSourcesDir)
	         .then(() => {
		         return Promise.all([
			         fs.copyAsync(path.join(dirname, '/build/dist/'), resourcesDir),
			         fs.copyAsync(path.join(dirname, '/app-desktop/', '/main.js'), path.join(electronSourcesDir, "main.js"))
		         ])
	         })
	         .then(() => {
		         return Promise.all([
			         fs.unlink(resourcesDir + "app.html", (e) => {
				         if (e) {
					         console.log("error deleting app.html: ", e)
				         }
			         }),
			         fs.unlink(resourcesDir + "app.js", (e) => {
				         if (e) {
					         console.log("error deleting app.js: ", e)
				         }
			         })
		         ])
	         })
	         .then(() => {
		         //create package.json for electron-builder
		         const builderPackageJSON = Object.assign(require(path.join(dirname, '/app-desktop/', '/package.json')), {
			         version: version
		         })

		         return fs.writeFile(path.join(electronSourcesDir, "/package.json"),
			         JSON.stringify(builderPackageJSON),
			         'utf8',
			         (e) => {
				         if (e) {
					         console.log("couldn't write package.json: ", e);
				         }
			         })
	         })
	         .then(() => {
		         //package for linux, win, mac
		         const builder = require("electron-builder")
		         return builder.build({
			         _: ['build'],
			         win: [],
			         mac: [],
			         linux: [],
			         p: 'always',
			         project: electronSourcesDir
		         })
	         })
}

module.exports = {
	packageDesktop
}