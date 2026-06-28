import type { Server as HttpServer } from 'node:http';
import type { DomainEvent, IEventBusAdapter } from '@beyondevent/event-bus';
import { Server as SocketIOServer } from 'socket.io';

export interface GatewayOptions {
  readonly corsOrigin?: string | string[] | boolean;
}

export interface IWebSocketGateway {
  attach(server: HttpServer): void;
  close(): Promise<void>;
}

export function createWebSocketGateway(
  eventBus: IEventBusAdapter,
  options: GatewayOptions = {},
): IWebSocketGateway {
  let io: SocketIOServer | undefined;
  let unsubscribeAll: (() => void) | undefined;

  return {
    attach(server: HttpServer): void {
      io = new SocketIOServer(server, {
        cors: { origin: options.corsOrigin ?? false },
        transports: ['websocket', 'polling'],
      });

      // Forward every published event to connected clients.
      // Phase 5: filter by simulationId once DomainEvent carries it.
      unsubscribeAll = eventBus.subscribeAll(async (event: DomainEvent) => {
        if (io === undefined) return;
        const payload = {
          id: event.id,
          type: event.type,
          payload: event.payload,
          // Flatten traceContext so the client PersistedEvent interface matches
          traceId: event.traceContext.traceId,
          spanId: event.traceContext.spanId,
          correlationId: event.traceContext.correlationId,
          causationId: event.traceContext.causationId ?? null,
          occurredAt: new Date(event.occurredAt).toISOString(),
          version: event.version,
          simulationId: event.simulationId ?? null,
          createdAt: new Date().toISOString(),
        };
        // Broadcast globally (for dashboards not scoped to a simulation)
        io.emit('event:published', payload);
        // Also emit to the scoped simulation room if simulationId is set
        if (event.simulationId) {
          io.to(event.simulationId).emit('simulation:event', payload);
        }
      });

      io.on('connection', (socket) => {
        socket.on('simulation:join', (simulationId: string) => {
          void socket.join(simulationId);
        });
        socket.on('simulation:leave', (simulationId: string) => {
          void socket.leave(simulationId);
        });
        socket.on('disconnect', () => undefined);
      });
    },

    async close(): Promise<void> {
      unsubscribeAll?.();
      await new Promise<void>((resolve) => {
        if (io === undefined) {
          resolve();
          return;
        }
        io.close(() => resolve());
      });
    },
  };
}
