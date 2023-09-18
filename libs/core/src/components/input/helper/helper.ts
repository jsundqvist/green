import { LitElement, html, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { constrainSlots } from 'utils/helpers'
import { ifDefined } from 'lit/directives/if-defined.js'
import { when } from 'lit/directives/when.js'
import styles from './style/helper.styles.scss'
import '../../icon/icon'
import '../../badge/badge'
import '../../tooltip/tooltip'

/**
 * 
 * @element gds-input-helper
 * @summary A custom input element that can be used in forms.
 * @documentation https://seb.io/docs/component/input-helper
 * @status beta
 * @since 1.0.0
 * 
 * @cssprop --gds-input-helper - content
 * 
 * @csspart gds-input-helper - The input helper element.
 * 
 * @slot label - The label or summary text.
 * @slot icon - The slot for the helper information icon.
 * @slot badge - The slot for the badge after icon.
 * @slot content - The slot for the content.
 * 
 **/

// TODO
// - [ ] Add a badge component
// - [ ] Add a tooltip component
// - [ ] Add a button component
// - [ ] If it has tooltip disable content slot and visceversa


@customElement('gds-input-helper')
export class GdsInputHelper extends LitElement {
  static styles = unsafeCSS(styles)

  static shadowRootOptions: ShadowRootInit = {
    mode: 'open',
    delegatesFocus: true,
  }

  // Private members
  #internals: ElementInternals

  constructor() {
    super()
    this.#internals = this.attachInternals()
    constrainSlots(this)
  }

  connectedCallback() {
    super.connectedCallback()
  }
  
  @property({ type: Boolean, reflect: true, attribute: 'content-visible' })
  isContentVisible = false;

  toggleContent() {
    this.isContentVisible = !this.isContentVisible;
  }

  slotIcon() {
    return html`
        <slot name="action" gds-allow="gds-icon"></slot>
    `;
  }

  slotBadge() {
    return html`
        <slot name="badge" gds-allow="gds-badge"></slot>
    `;
  }

  slotContent() {
    return this.isContentVisible
    // return this.textContent
    ? html`
      <div class="gds-input-helper-content">
        <slot part="content" gds-allow="#text"></slot>
      </div>`
    : ''
  }
  
  @property({ type: String, reflect: true, attribute: 'data-tooltip' })
  helperTooltip = null

  render() { 
    const hasIconSlot = this.querySelector('[slot="action"]') !== null;
    const hasBadgeSlot = this.querySelector('[slot="badge"]') !== null;
    const IconSlot = html`${when( hasIconSlot, () => this.slotIcon())}`
    const ContentSlot = html`${this.slotContent()}`;
    const hasContent = this.isContentVisible || (this.textContent?.trim() !== '');

    return html`
      <div class="gds-input-helper">
        <div class="gds-input-helper-header">
          <span 
            class="gds-input-helper-title" 
            @click=${this.toggleContent}
            >
            Some text label
          </span>
          <div class="gds-input-helper-options">
            ${when(hasContent, () => html`
              <button
                class="gds-input-helper-option"
                data-tooltip=${ifDefined(this.helperTooltip)}
                @click=${this.toggleContent}
              >
                ${IconSlot}
              </button>
              `)}
              ${IconSlot}
            ${when( hasBadgeSlot, () => this.slotBadge())}
          </div>
        </div>
        ${ifDefined(ContentSlot)}
      </div>
  ` }
}
