import { NoTransitionError, StateMachine } from 'flowstate-js'
import { ORDER_EVENTS, ORDER_STATUSES } from '../constants/orderStatuses.js'
import { StatusChangeError } from './StatusChangeError.js'

const { RECEIVED, PACKED, SHIPPED, DELIVERED, CANCELLED } = ORDER_STATUSES
const { PACK, SHIP, DELIVER, CANCEL } = ORDER_EVENTS

/**
 * The steps of an order, kept by a state machine from flowstate-js.
 */
export class OrderLifecycle {
  #machine

  /**
   * Starts at the order's saved status.
   *
   * @param {string} status - One of ORDER_STATUSES, such as "packed".
   */
  constructor(status) {
    this.#machine = this.#createMachine(status)
  }

  /**
   * The order's status.
   *
   * @returns {string} Such as "packed".
   */
  get status() {
    return this.#machine.currentStateName
  }

  /**
   * Lists the events the order can take now.
   *
   * @returns {string[]} Such as ["ship", "cancel"] for a packed order, or [] for a delivered one.
   */
  listAllowedEvents() {
    return this.#machine.listEventNamesFrom(this.status)
  }

  /**
   * Moves the order to the step the event leads to.
   *
   * @param {string} eventName - One of ORDER_EVENTS, such as "pack".
   * @throws {StatusChangeError} If the order cannot take the event now, such as "ship" for a received order.
   */
  changeStatus(eventName) {
    try {
      this.#machine.send(eventName)
    } catch (error) {
      if (!(error instanceof NoTransitionError)) {
        throw error
      }

      throw new StatusChangeError(this.status, eventName, { cause: error })
    }
  }

  /**
   * Lists the steps from "received" to the order's status.
   *
   * @returns {string[]} Such as ["received", "packed"], or ["received", "cancelled"].
   */
  listCompletedSteps() {
    const machineFromStart = this.#createMachine(RECEIVED)

    return [RECEIVED, ...this.#walkTo(machineFromStart, this.status)]
  }

  /**
   * Lists the steps left until the order is delivered. A cancelled order has none.
   *
   * @returns {string[]} Such as ["shipped", "delivered"].
   */
  listRemainingSteps() {
    const machineFromNow = this.#createMachine(this.status)

    if (!machineFromNow.canReach(DELIVERED)) {
      return []
    }

    return this.#walkTo(machineFromNow, DELIVERED)
  }

  /**
   * The order's steps and the moves between them.
   *
   * @param {string} status - The step to start in.
   * @returns {StateMachine} A new machine.
   */
  #createMachine(status) {
    const machine = new StateMachine(status)

    for (const stepName of Object.values(ORDER_STATUSES)) {
      machine.defineState(stepName)
    }

    return machine
      .defineTransition({ from: RECEIVED, to: PACKED, on: PACK })
      .defineTransition({ from: PACKED, to: SHIPPED, on: SHIP })
      .defineTransition({ from: SHIPPED, to: DELIVERED, on: DELIVER })
      .defineTransition({ from: RECEIVED, to: CANCELLED, on: CANCEL })
      .defineTransition({ from: PACKED, to: CANCELLED, on: CANCEL })
  }

  /**
   * Sends the events of the shortest path, which changes the machine.
   *
   * @param {StateMachine} machine - A new machine.
   * @param {string} stepName - Where to go.
   * @returns {string[]} The steps passed, the last one included.
   */
  #walkTo(machine, stepName) {
    const eventNames = machine.findPathTo(stepName)
    const stepsPassed = []

    for (const eventName of eventNames) {
      machine.send(eventName)
      stepsPassed.push(machine.currentStateName)
    }

    return stepsPassed
  }
}
