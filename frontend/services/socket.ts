import { Emitter } from '../utils/emitter';
import type { Color } from '../../backend/src/domain/value-objects/color';
import { ExternalRound } from '../../backend/src/presentation/types/external-round';
import type { TrayCase } from '../../backend/src/domain/value-objects/tray-case';

export class Socket {
  private sse!: EventSource;
  public eventBus: Emitter = new Emitter()

  constructor(
    private readonly baseUrl: string,
  ) {}
  
  init() {
    this.sse = new EventSource(this.baseUrl + "/sse");

    console.log('INI')

    /*
      * The event "message" is a special case, as it
      * will capture events without an event field
      * as well as events that have the specific type
      * `event: message` It will not trigger on any
      * other event type.
      */
    this.sse.addEventListener("message", (e) => {
      console.log(JSON.parse(e.data));
    });
    this.sse.addEventListener("message-broacast", (e) => {
      console.log("HERE2", JSON.parse(e.data))
    });

    this.sse.addEventListener('dice-launched', data => this.eventBus.emit('dice-launched', data))
    this.sse.addEventListener('game-created', data => this.eventBus.emit<any>('game-created', data));
    this.sse.addEventListener('game-deleted', gameId => this.eventBus.emit<String>('game-deleted', gameId));
    this.sse.addEventListener('game-finished', data => this.eventBus.emit<boolean>('game-finished', data));
    this.sse.addEventListener('game-player-joined', ({ data }) => this.eventBus.emit<any>('game-player-joined', JSON.parse(data)));
    this.sse.addEventListener('game-player-leaved', ({ data }) => this.eventBus.emit<String>('game-player-leaved', JSON.parse(data)));
    this.sse.addEventListener('game-starts', () => this.eventBus.emit<boolean>('game-starts', true));
    this.sse.addEventListener('message-broacast', ({ data }) => this.eventBus.emit<String>('message-broacast', JSON.parse(data)));
    this.sse.addEventListener('pawn-moved', data => this.eventBus.emit('pawn-moved', data));
    this.sse.addEventListener('player-color-selection', data => this.eventBus.emit<{ playerId: string, color: Color }>('player-color-selection', data));
    this.sse.addEventListener('round-created', round => this.eventBus.emit<ExternalRound>('round-created', round))
    this.sse.addEventListener('traycase-updated', traycase => this.eventBus.emit<TrayCase>('traycase-updated', traycase))
  }
}
