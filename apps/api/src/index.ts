import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Layer } from "effect";
import { TodoApi } from "@ts-monorepo/domain";
import { HttpRouter } from "effect/unstable/http";
import { HttpApiBuilder, HttpApiScalar } from "effect/unstable/httpapi";
import { createServer } from "node:http";
import { TodoApiGroupLive } from "./TodoApiLive";
import { TodoRepository } from "./TodoRepository";

const port = Number(process.env.PORT ?? 3000);

const ApiLive = Layer.mergeAll(
  HttpApiBuilder.layer(TodoApi).pipe(
    Layer.provide(TodoApiGroupLive),
    Layer.provide(HttpApiScalar.layer(TodoApi)),
  ),
  HttpRouter.cors(),
).pipe(
  HttpRouter.serve,
  Layer.provide(TodoRepository.layer),
  Layer.provide(NodeHttpServer.layer(createServer, { port })),
);

Layer.launch(ApiLive).pipe(NodeRuntime.runMain);
