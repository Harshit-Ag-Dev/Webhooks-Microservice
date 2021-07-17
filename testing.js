let path 				= require("path");
let { ServiceBroker } 	= require("moleculer");
let ApiService 	        = require("moleculer-web");
let express 			= require("express");
let DbService           = require("moleculer-db");
const database = require("mime-db");
const { createGzip } = require("zlib");
// Create broker
let broker = new ServiceBroker({
	logger: console
});

broker.createService(DbService, {
    name: "Database",
    settings: {
        fields: ["_id","url"],
    },
    afterConnected() {
        this.logger.info("Connected Successfulty");
        this.adapter.clear();
    }
});

broker.createService({
    name: "webhooks",
	mixins: [ApiService],

	settings: {
		server: false,
		routes: [{
			whitelist: [
				"webhooks.register",
				"webhooks.update",
                "webhooks.list",
                "webhooks.trigger"
			],
			aliases: {
				"GET register": "webhooks.register",
                "GET update": "webhooks.update",
                "GET list": "webhooks.list",
                "POST trigger": "webhooks.trigger",
			},
			mappingPolicy: "all",
            callOptions: {
                timeout: 500,
                retries: 5,
                fallbackResponse(ctx, err) {  }
            },
		}],
    },
    actions: {
        register(ctx) {
            broker.call("Database.create", {url: ctx.params.url})
            .then(console.log);
        },
        update(ctx) {
            broker.call("Database.update", {id:ctx.params.id, url: ctx.params.newUrl})
            .then(console.log);
        },
        list(ctx) {
            broker.call("Database.list").then(console.log);
        },
        trigger(ctx) {
            let listofUrls = broker.call("Database.list")
            .then()
        },
    },

	started() {

		// Create Express application
		const app = express();

		// Use ApiGateway as middleware
		app.use("/admin", this.express());

		// Listening
		app.listen(3333, err => {
			if (err)
				return this.logger.error(err);

			this.logger.info("Open http://localhost:3333/admin/register?url=John");
		});
	}
});

// Start server
broker.start();