// Input your config
var config={
	host:"playground.qlik.com",
	prefix:"/playground/",
	port:"443",
	isSecure:true,
	rejectUnauthorized:false,
	apiKey:"X1F9wXDNLh691o0RnnYf5UrEl90AepwJ", //change to env variable
	appname:"d7ad663d-2413-4088-a3c9-e5ed0283c788"
};

function authenticate() {
	Playground.authenticate(config);
};

require.config({
	paths: {
		"js": (config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ) + config.prefix + "resources/js",
		"themes": (config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ) + config.prefix + "resources/themes",
		"autogenerated": (config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ) + config.prefix + "resources/autogenerated"
	}
});

function main() {
	require( ["../src/swr-funnelchart"], function ( funnelchart ) {

		require.config({
			baseUrl: ( config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port: "") + config.prefix + "resources"
		});

		require(['js/qlik'], function( qlik ) {
			// Suppress Qlik error dialogs and handle errors how you like.
			 qlik.setOnError( function ( error ) {
				console.log( error );
			});

			// Register the extension
			qlik.registerExtension( "funnelchart", funnelchart );

			// Open a dataset on the server.
			var app = qlik.openApp( config.appname, config );
			window.app = app;

			app.model.waitForOpen.promise.then( function() {
				// Logging app info
				app.model.enigmaModel.getAppProperties().then( function( prop ) {
					console.log( "Connecting to app: %s (%s)", prop.qTitle, config.appname  );
				} );

				// Creating the visualization
				app.visualization.create(
					"funnelchart",
					[{
						qDef: { qFieldDefs: ["Characters"]},
						qOtherTotalSpec: {qOtherMode: "OTHER_COUNTED", qOtherCounted: "5", qSuppressOther: true}
					},
					"=Count([Kills])"],
					{/*showTitles: false*/}
					// props: {
					// 	chartBottomPinch: 0,
					// 	chartCurved : true,
					// 	chartInverted:false
					// }
				).then( function ( vis ) {
					vis.show( "extension", {
						onRendered: function(){
							document.getElementById("extension").classList.add( "rendered" );
						}
					} );
				} ).catch( function ( err ) {
					console.err( err );
				} );
			});
		} );
	} );
};
