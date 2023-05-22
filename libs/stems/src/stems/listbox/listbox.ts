import { LitElement, html, unsafeCSS } from 'lit'
import { customElement } from 'lit/decorators.js'
import { Ref, createRef, ref } from 'lit/directives/ref.js'
import { createComponent } from '@lit-labs/react'
import * as React from 'react'
import { TransitionalStyles } from '../../transitional-styles'

import 'reflect-metadata'
import style from './listbox.styles'

/**
 * @element gds-listbox
 * @slot - The default slot. Only `gds-option` elements should be used here.
 *
 * A listbox is a widget that allows the user to select one or more items from a list of choices.
 * This primitive corresponds to the aria listbox role: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/listbox_role
 *
 * The listbox handles keyboard navigation and manages focus and selection of options.
 *
 * Can be used together with the `gds-option` primitive.
 */
@customElement('gds-listbox')
export class GdsListbox extends LitElement {
  static styles = unsafeCSS(style)

  private internals: ElementInternals
  private slotRef: Ref<HTMLSlotElement> = createRef()

  constructor() {
    super()

    this.internals = this.attachInternals()
    this.internals.role = 'listbox'
  }

  /**
   * Returns a list of all `gds-option` elements in the listbox.
   */
  get optionElements() {
    let slot = this.slotRef.value
    if (!slot) return []

    // Unwrap nested slots
    while (slot.assignedElements()[0].nodeName === 'SLOT') {
      slot = slot.assignedElements()[0] as HTMLSlotElement
    }

    return (slot.assignedElements() as GdsOption[]) || []
  }

  connectedCallback(): void {
    super.connectedCallback()
    TransitionalStyles.instance.apply(this, 'gds-listbox')

    this.addEventListener('keydown', (e) => {
      if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return
      if (!(e.target instanceof GdsOption)) return

      e.stopPropagation()
      e.preventDefault()

      if (e.key === 'ArrowDown') {
        const nextItem = e.target?.nextElementSibling as GdsOption
        nextItem?.focus()
      }
      if (e.key === 'ArrowUp') {
        const prevItem = e.target?.previousElementSibling as GdsOption
        prevItem?.focus()
      }
    })

    this.addEventListener('select', (e) => {
      const option = e.target as GdsOption
      Array.from(this.optionElements).forEach((el) => {
        if (el !== option) el.unselect()
      })
    })
  }

  /**
   * Focuses the first option in the listbox.
   * If the listbox is empty, nothing happens.
   *
   * @public
   */
  focus() {
    const firstItem = this.optionElements[0]
    firstItem?.focus()
  }

  render() {
    return html`<slot ${ref(this.slotRef)}></slot> `
  }
}

export const GdsListboxReact = createComponent({
  tagName: 'gds-listbox',
  elementClass: GdsListbox,
  react: React,
})

/**
 * @element gds-option
 * @slot - The default slot. Custom content can be used to display the option.
 *
 * A listbox option is an option in a listbox widget.
 * This primitive corresponds to the aria `option` role: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/option_role
 *
 * Can be used together with the `gds-listbox` primitive.
 */
@customElement('gds-option')
export class GdsOption extends LitElement {
  static styles = unsafeCSS(style)

  private internals: ElementInternals

  value: any

  static properties = {
    value: {},
  }

  constructor() {
    super()

    this.internals = this.attachInternals()
    this.internals.role = 'option'

    this.addEventListener('click', () => {
      this.select()
    })
    this.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return
      this.select()
    })
  }

  connectedCallback(): void {
    super.connectedCallback()
    TransitionalStyles.instance.apply(this, 'gds-option')
  }

  /**
   * Selects the option and dispatches a `select` event.
   *
   * @fires select
   * @public
   */
  select() {
    this.internals.ariaSelected = 'true'
    this.dispatchEvent(
      new CustomEvent('select', {
        bubbles: true,
        composed: true,
        detail: {
          value: this.value,
        },
      })
    )
  }

  unselect() {
    this.internals.ariaSelected = 'false'
  }

  /**
   * Focuses the option.
   *
   * @public
   * @param options - Focus options
   */
  focus(options?: FocusOptions | undefined): void {
    this.setAttribute('tabindex', '0')
    super.focus(options)

    // This hack is here to make sure the option gets focus
    // when the containing popover is first opened, because
    // when this is called, the element may not yet be displayed
    // and therefore `super.focus()` does nothing until some
    // arbitrary amount of time has passed.
    if (document.activeElement !== this) {
      const iv = setInterval(() => {
        if (document.activeElement === this) clearInterval(iv)
        super.focus(options)
      }, 10)
    }
  }

  onblur = () => {
    this.setAttribute('tabindex', '-1')
  }

  render() {
    return html`<slot></slot> `
  }
}

export const GdsOptionReact = createComponent({
  tagName: 'gds-option',
  elementClass: GdsOption,
  react: React,
})
