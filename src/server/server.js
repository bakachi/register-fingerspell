import Hapi from "@hapi/hapi";
import routes from "./routes.js";

const init = async () => {
  const server = Hapi.server({
    port: 8000,
    host: "localhost",
  });

  server.route(routes);

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.error(err);
  process.exit(1);
});

init();
